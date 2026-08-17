const { createAnalysis } = require("../services/analysisService");

const create = async (req, res, next) => {
  try {
    const analysis = await createAnalysis(req.body);

    res.status(201).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
};