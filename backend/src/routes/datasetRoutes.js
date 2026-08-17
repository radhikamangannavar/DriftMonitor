const express = require("express");
const { create } = require("../controllers/datasetController");

const router = express.Router();

router.post("/", create);

module.exports = router;