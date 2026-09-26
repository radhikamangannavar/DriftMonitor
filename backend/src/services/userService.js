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

module.exports = {
  createUser,
};