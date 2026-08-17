const { createOrganization } = require("../services/organizationService");

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

module.exports = {
  create,
};