const express = require("express");

const {
  login,
  register,
  me,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);

module.exports = router;