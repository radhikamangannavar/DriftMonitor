const {
  loginUser,
  registerUser,
} = require("../services/authService");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(
      email,
      password
    );

    req.session.userId = user._id.toString();
    req.session.organizationId =
      user.organizationId.toString();
    req.session.role = user.role;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      organizationName,
      organizationSlug,
    } = req.body;

    const result = await registerUser({
      name,
      email,
      password,
      organizationName,
      organizationSlug,
    });

    const user = result.user;

    req.session.userId = user._id.toString();
    req.session.organizationId =
      user.organizationId.toString();
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    res.json({
      success: true,
      data: {
        userId: req.session.userId,
        organizationId:
          req.session.organizationId,
        role: req.session.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  me,
};