const { spawn } = require("child_process");
const path = require("path");

const Analysis = require("../models/Analysis");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");

const runPythonAnalysis = (
  baselinePath,
  currentPath,
  configuration
) => {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(__dirname, "../../../");

    const pythonScript = path.join(
      projectRoot,
      "drift_engine",
      "main.py"
    );

    const pythonCommand =
      process.env.PYTHON_COMMAND || "python3";

    const configurationJson =
      JSON.stringify(configuration || {});

    const pythonProcess = spawn(
      pythonCommand,
      [
        pythonScript,
        baselinePath,
        currentPath,
        configurationJson,
      ],
      {
        cwd: projectRoot,
      }
    );

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (error) => {
      reject(
        new Error(
          `Failed to start Python process: ${error.message}`
        )
      );
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Python analysis failed: ${stderr || stdout}`
          )
        );
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(
          new Error(
            `Invalid JSON returned by Python: ${error.message}`
          )
        );
      }
    });
  });
};

const createAnalysis = async ({
  organizationId,
  modelId,
  baselineDatasetId,
  currentDatasetId,
}) => {
  // --------------------------------------------------
  // 1. Validate model
  // --------------------------------------------------

  const model = await Model.findOne({
    _id: modelId,
    organizationId,
  });

  if (!model) {
    throw new Error("Model not found");
  }

  // --------------------------------------------------
  // 2. Validate baseline dataset
  // --------------------------------------------------

  const baselineDataset = await Dataset.findOne({
    _id: baselineDatasetId,
    organizationId,
    modelId,
    type: "baseline",
  });

  // --------------------------------------------------
  // 3. Validate current dataset
  // --------------------------------------------------

  const currentDataset = await Dataset.findOne({
    _id: currentDatasetId,
    organizationId,
    modelId,
    type: "current",
  });

  if (!baselineDataset) {
    throw new Error(
      "Baseline dataset not found for this model"
    );
  }

  if (!currentDataset) {
    throw new Error(
      "Current dataset not found for this model"
    );
  }

  // --------------------------------------------------
  // 4. Create pending analysis
  // --------------------------------------------------

  const analysis = await Analysis.create({
    organizationId,
    modelId,
    baselineDatasetId,
    currentDatasetId,
    status: "pending",
  });

  try {
    // --------------------------------------------------
    // 5. Read configuration from Model
    // --------------------------------------------------

    const configuration = model.configuration || {};

    // --------------------------------------------------
    // 6. Run Python engine
    // --------------------------------------------------

    const pythonResult = await runPythonAnalysis(
      baselineDataset.storagePath,
      currentDataset.storagePath,
      configuration
    );

    if (!pythonResult.success) {
      throw new Error(
        pythonResult.error || "Python analysis failed"
      );
    }

    const report = pythonResult.report;

    // --------------------------------------------------
    // 7. Extract summary values
    // --------------------------------------------------

    const modelHealth =
      report.summary?.model_health;

    const affectedCoverage =
      report.summary?.affected_coverage;

    const overallConfidence =
      report.decision_trace
        ?.model_decision
        ?.overall_confidence;

    const recommendationMap = {
  CRITICAL: "Validate Data",
  HIGH: "Investigate",
  MEDIUM: "Monitor",
  LOW: "Monitor",
  HEALTHY: "Monitor",
};

const recommendation =
  recommendationMap[modelHealth] || "Monitor";

    // --------------------------------------------------
    // 8. Persist immutable analysis result
    // --------------------------------------------------

    await Analysis.findByIdAndUpdate(
  analysis._id,
  {
    status: "completed",
    health: modelHealth,
    affectedCoverage,
    overallConfidence,
    recommendation,
    report,
  },
{ returnDocument: "after" }
);

    // --------------------------------------------------
    // 9. Return complete report
    // --------------------------------------------------

    return {
      analysisId: analysis._id,
      status: "completed",
      report,
    };
  } catch (error) {
    await Analysis.findByIdAndUpdate(
      analysis._id,
      {
        status: "failed",
      }
    );

    throw error;
  }
};

const getAnalysisById = async (
  analysisId,
  organizationId
) => {
  return await Analysis.findOne({
    _id: analysisId,
    organizationId,
  })
    .populate({
      path: "baselineDatasetId",
      select: "-storagePath",
    })
    .populate({
      path: "currentDatasetId",
      select: "-storagePath",
    })
    .populate("organizationId")
    .populate("modelId");
};
const getAnalysesByOrganization = async (
  organizationId
) => {
  return await Analysis.find({
    organizationId,
  })
    .populate({
      path: "modelId",
      select: "name",
    })
    .populate({
      path: "baselineDatasetId",
      select: "name type fileName",
    })
    .populate({
      path: "currentDatasetId",
      select: "name type fileName",
    })
    .sort({
      createdAt: -1,
    });
};
module.exports = {
  createAnalysis,
  getAnalysisById,
  getAnalysesByOrganization,
};