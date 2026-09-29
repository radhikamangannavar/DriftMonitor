const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Organization = require("../models/Organization");

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  return user;
};

const registerUser = async ({
  name,
  email,
  password,
  organizationName,
  organizationSlug,
}) => {
  if (
    !name ||
    !email ||
    !password ||
    !organizationName ||
    !organizationSlug
  ) {
    throw new Error(
      "Name, email, password, organization name and organization slug are required"
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedSlug = organizationSlug.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const existingOrganization = await Organization.findOne({
    slug: normalizedSlug,
  });

  if (existingOrganization) {
    throw new Error(
      "An organization with this slug already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const organization = await Organization.create({
    name: organizationName.trim(),
    slug: normalizedSlug,
  });

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "admin",
    organizationId: organization._id,
  });

  const userObject = user.toObject();
  delete userObject.password;

  return {
    user: userObject,
    organization,
  };
};

module.exports = {
  loginUser,
  registerUser,
};