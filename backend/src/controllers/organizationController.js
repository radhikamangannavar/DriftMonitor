const {
  createOrganization,
  getOrganizationById,
  updateOrganization,
} = require("../services/organizationService");

const create = async (req, res, next) => {
  try {
    const organization = await createOrganization(req.body);

    res.status(201).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentOrganization = async (req, res, next) => {
  try {
    const organization = await getOrganizationById(
      req.session.organizationId
    );

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

const updateCurrentOrganization = async (req, res, next) => {
  try {
    const organization = await updateOrganization(
      req.session.organizationId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: organization,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getCurrentOrganization,
  updateCurrentOrganization,
};