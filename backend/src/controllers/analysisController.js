const {
  createAnalysis,
  getAnalysisById,
  getAnalysesByOrganization,
} = require("../services/analysisService");

const create = async (req, res, next) => {
  try {
    const {
      modelId,
      baselineDatasetId,
      currentDatasetId,
    } = req.body;

    const organizationId =
      req.session.organizationId;

    if (
      !organizationId ||
      !modelId ||
      !baselineDatasetId ||
      !currentDatasetId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "modelId, baselineDatasetId and currentDatasetId are required",
      });
    }

    const result = await createAnalysis({
      organizationId,
      modelId,
      baselineDatasetId,
      currentDatasetId,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const organizationId =
      req.session.organizationId;

    const analysis =
      await getAnalysisById(
        req.params.id,
        organizationId
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
const getByOrganization = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      req.session.organizationId;

    const analyses =
      await getAnalysesByOrganization(
        organizationId
      );

    return res.status(200).json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  create,
  getById,
  getByOrganization,
};