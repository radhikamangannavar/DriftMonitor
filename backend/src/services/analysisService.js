const Analysis = require("../models/Analysis");

const createAnalysis = async (analysisData) => {
  return await Analysis.create(analysisData);
};

module.exports = {
  createAnalysis,
};