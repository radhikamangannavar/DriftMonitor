const Organization = require("../models/Organization");

const createOrganization = async (organizationData) => {
  return await Organization.create(organizationData);
};

module.exports = {
  createOrganization,
};