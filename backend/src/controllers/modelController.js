const {
  createModel,
  getModelsByOrganization,
  getModelById,
  updateModelConfiguration,
  getModelFeatures,
} = require("../services/modelService");

const create = async (req, res, next) => {
  try {
    const {
      name,
      organizationId,
      riskProfile,
    } = req.body;

    if (!name || !organizationId) {
      return res.status(400).json({
        success: false,
        message:
          "name and organizationId are required",
      });
    }

    const model = await createModel({
      name,
      organizationId,
      riskProfile,
    });

    res.status(201).json({
      success: true,
      data: model,
    });
  } catch (error) {
    next(error);
  }
};

const getByOrganization = async (req, res, next) => {
  try {
    const organizationId =
      req.session.organizationId;

    const models =
      await getModelsByOrganization(
        organizationId
      );

    res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { modelId } = req.params;
    const organizationId =
      req.session.organizationId;

    const model = await getModelById(
      modelId,
      organizationId
    );

    if (!model) {
      return res.status(404).json({
        success: false,
        message: "Model not found",
      });
    }

    res.json({
      success: true,
      data: model,
    });
  } catch (error) {
    next(error);
  }
};

const updateConfiguration = async (
  req,
  res,
  next
) => {
  try {
    const { modelId } = req.params;

    const {
      organizationId,
      configuration,
    } = req.body;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message:
          "organizationId is required",
      });
    }

    if (!configuration) {
      return res.status(400).json({
        success: false,
        message:
          "configuration is required",
      });
    }

    const model =
      await updateModelConfiguration({
        modelId,
        organizationId,
        configuration,
      });

    res.status(200).json({
      success: true,
      data: model,
    });
  } catch (error) {
    next(error);
  }
};

const getFeatures = async (
  req,
  res,
  next
) => {
  try {
    const { modelId } = req.params;

    const organizationId =
      req.session.organizationId;

    const features =
      await getModelFeatures(
        modelId,
        organizationId
      );

    res.status(200).json({
      success: true,
      features,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getByOrganization,
  getById,
  updateConfiguration,
  getFeatures,
};