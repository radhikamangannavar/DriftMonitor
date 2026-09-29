const express = require("express");

const {
  create,
  getCurrentOrganization,
  updateCurrentOrganization,
} = require("../controllers/organizationController");

const router = express.Router();

router.post("/", create);

router.get("/me", getCurrentOrganization);

router.patch("/me", updateCurrentOrganization);

module.exports = router;