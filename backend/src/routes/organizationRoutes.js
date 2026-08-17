const express = require("express");
const { create } = require("../controllers/organizationController");

const router = express.Router();
const validateOrganization = require("../middleware/validateOrganization");
router.post("/", validateOrganization, create);

module.exports = router;