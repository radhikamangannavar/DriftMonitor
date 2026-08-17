const { createDataset } = require("../services/datasetService");

const create = async (req, res, next) => {
  try {
    const dataset = await createDataset(req.body);

    res.status(201).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
};