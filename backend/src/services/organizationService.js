const Organization = require("../models/Organization");

const createOrganization = async (organizationData) => {
  return await Organization.create(organizationData);
};

const getOrganizationById = async (organizationId) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }

  return organization;
};

const updateOrganization = async (organizationId, organizationData) => {
  const organization = await Organization.findByIdAndUpdate(
    organizationId,
    organizationData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!organization) {
    const error = new Error("Organization not found");
    error.statusCode = 404;
    throw error;
  }

  return organization;
};

module.exports = {
  createOrganization,
  getOrganizationById,
  updateOrganization,
};