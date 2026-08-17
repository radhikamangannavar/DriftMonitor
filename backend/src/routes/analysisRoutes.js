const express = require("express");
const { create } = require("../controllers/analysisController");

const router = express.Router();

router.post("/", create);

module.exports = router;