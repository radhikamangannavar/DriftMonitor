const {
  createUser,
  getMembersByOrganization,
  createOrganizationMember,
  updateMemberRole,
  removeMember,
} = require("../services/userService");
const create = async (req, res, next) => {
  try {
    const user = await createUser(req.body);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
const getMembers = async (req, res, next) => {
  try {
    const members = await getMembersByOrganization(
      req.session.organizationId
    );

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

const createMember = async (req, res, next) => {
  try {
    const member = await createOrganizationMember({
      ...req.body,
      organizationId: req.session.organizationId,
    });

    const memberObject = member.toObject();
    delete memberObject.password;

    res.status(201).json({
      success: true,
      data: memberObject,
    });
  } catch (error) {
    next(error);
  }
};
const updateRole = async (req, res, next) => {
  try {
    const member = await updateMemberRole(
      req.params.userId,
      req.session.organizationId,
      req.body.role
    );

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await removeMember(
      req.params.userId,
      req.session.organizationId,
      req.session.userId
    );

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getMembers,
  createMember,
  updateRole,
  remove,
};