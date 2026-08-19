const {
  createAnalysis,
  getAnalysisById,
} = require("../services/analysisService");

const create = async (req, res, next) => {
  try {
    const {
      organizationId,
      baselineDatasetId,
      currentDatasetId,
    } = req.body;

    if (
      !organizationId ||
      !baselineDatasetId ||
      !currentDatasetId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "organizationId, baselineDatasetId and currentDatasetId are required",
      });
    }

    const result = await createAnalysis({
      organizationId,
      baselineDatasetId,
      currentDatasetId,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const analysis = await getAnalysisById(req.params.id);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  create,
  getById,
};