const Dataset = require("../models/Dataset");
const Model = require("../models/Model");
const Organization = require("../models/Organization");


const createDataset = async (
  datasetData
) => {
  const {
    organizationId,
    modelId,
  } = datasetData;


  const organization =
    await Organization.findById(
      organizationId
    );

  if (!organization) {
    throw new Error(
      "Organization not found"
    );
  }


  const model =
    await Model.findOne({
      _id: modelId,
      organizationId,
    });

  if (!model) {
    throw new Error(
      "Model not found for this organization"
    );
  }


  return await Dataset.create(
    datasetData
  );
};


const getDatasetsByOrganization =
  async (organizationId) => {
    return await Dataset.find({
      organizationId,
    })
      .populate(
        "modelId",
        "name"
      )
      .populate(
        "uploadedBy",
        "name email"
      )
      .select("-storagePath")
      .sort({
        createdAt: -1,
      });
  };


module.exports = {
  createDataset,
  getDatasetsByOrganization,
};