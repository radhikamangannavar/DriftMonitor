const Dataset = require("../models/Dataset");

const createDataset = async (datasetData) => {
  return await Dataset.create(datasetData);
};

module.exports = {
  createDataset,
};