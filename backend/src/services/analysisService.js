const { spawn } = require("child_process");
const path = require("path");

const Analysis = require("../models/Analysis");
const Dataset = require("../models/Dataset");

const runPythonAnalysis = (baselinePath, currentPath) => {
  return new Promise((resolve, reject) => {
    const projectRoot = path.resolve(__dirname, "../../../");

    const pythonScript = path.join(
      projectRoot,
      "drift_engine",
      "main.py"
    );

    const pythonCommand =
      process.env.PYTHON_COMMAND || "python3";

    const pythonProcess = spawn(
      pythonCommand,
      [
        pythonScript,
        baselinePath,
        currentPath,
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
  baselineDatasetId,
  currentDatasetId,
}) => {
  const baselineDataset = await Dataset.findOne({
    _id: baselineDatasetId,
    organizationId,
    type: "baseline",
  });

  const currentDataset = await Dataset.findOne({
    _id: currentDatasetId,
    organizationId,
    type: "current",
  });

  if (!baselineDataset) {
    throw new Error("Baseline dataset not found");
  }

  if (!currentDataset) {
    throw new Error("Current dataset not found");
  }

  const analysis = await Analysis.create({
    organizationId,
    baselineDatasetId,
    currentDatasetId,
    status: "pending",
  });

  try {
    const pythonResult = await runPythonAnalysis(
      baselineDataset.storagePath,
      currentDataset.storagePath
    );

    if (!pythonResult.success) {
      throw new Error(
        pythonResult.error || "Python analysis failed"
      );
    }

    const report = pythonResult.report;

    const modelHealth = report.summary.model_health;

    const affectedCoverage =
      report.summary.affected_coverage;

    const overallConfidence =
  report.decision_trace?.model_decision?.overall_confidence;

await Analysis.findByIdAndUpdate(
  analysis._id,
  {
    status: "completed",
    health: modelHealth,
    affectedCoverage,
    overallConfidence,
    recommendation: report.recommendations?.[0],
  },
  { new: true }
);

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
const getAnalysisById = async (analysisId) => {
  return await Analysis.findById(analysisId)
    .populate({
      path: "baselineDatasetId",
      select: "-storagePath",
    })
    .populate({
      path: "currentDatasetId",
      select: "-storagePath",
    })
    .populate("organizationId");
};
module.exports = {
  createAnalysis,
  getAnalysisById,
};