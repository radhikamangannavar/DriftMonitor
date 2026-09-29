const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createUser = async (userData) => {
  const {
    name,
    email,
    password,
    role,
    organizationId,
  } = userData;

  if (!password) {
    throw new Error("Password is required");
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error(
      "User with this email already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    12
  );

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    organizationId,
  });

  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

const getMembersByOrganization = async (organizationId) => {
  return await User.find({ organizationId })
    .select("name email role createdAt")
    .sort({ createdAt: 1 });
};

const createOrganizationMember = async ({
  name,
  email,
  password,
  role,
  organizationId,
}) => {
  if (!name || !email || !password || !role) {
    throw new Error("Name, email, password and role are required");
  }

  if (!["admin", "analyst", "viewer"].includes(role)) {
    throw new Error("Invalid member role");
  }

  const existingUser = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  return await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role,
    organizationId,
  });
};

const updateMemberRole = async (userId, organizationId, role) => {
  if (!["admin", "analyst", "viewer"].includes(role)) {
    throw new Error("Invalid member role");
  }

  const user = await User.findOneAndUpdate(
    {
      _id: userId,
      organizationId,
    },
    { role },
    {
      new: true,
      runValidators: true,
    }
  ).select("name email role createdAt");

  if (!user) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const removeMember = async (userId, organizationId, currentUserId) => {
  if (String(userId) === String(currentUserId)) {
    throw new Error("You cannot remove yourself");
  }

  const user = await User.findOneAndDelete({
    _id: userId,
    organizationId,
  });

  if (!user) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  createUser,
  getMembersByOrganization,
  createOrganizationMember,
  updateMemberRole,
  removeMember,
};
