const User = require("../models/User");

const createUser = async (userData) => {
  return await User.create(userData);
};

module.exports = {
  createUser,
};