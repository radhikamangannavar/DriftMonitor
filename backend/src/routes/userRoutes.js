const express = require("express");
const { create } = require("../controllers/userController");

const router = express.Router();

router.post("/", create);

module.exports = router;