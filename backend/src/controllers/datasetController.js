const {
  createDataset,
  getDatasetsByOrganization,
} = require("../services/datasetService");

const create = async (req, res, next) => {
  try {
    const {
      name,
      type,
      modelId,
    } = req.body;

    const organizationId =
      req.session.organizationId;

    const uploadedBy =
      req.session.userId;

    if (!name || !type || !modelId) {
      return res.status(400).json({
        success: false,
        message:
          "Name, type and modelId are required",
      });
    }

    const dataset = await createDataset({
      name,
      type,
      modelId,
      organizationId,
      uploadedBy,
    });

    res.status(201).json({
      success: true,
      data: dataset,
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

    const datasets =
      await getDatasetsByOrganization(
        organizationId
      );

    res.status(200).json({
      success: true,
      data: datasets,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  create,
  getByOrganization,
};