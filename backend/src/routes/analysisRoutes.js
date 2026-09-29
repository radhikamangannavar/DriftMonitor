const express = require("express");

const {
  create,
  getById,
  getByOrganization,
} = require("../controllers/analysisController");

const requireRole = require("../middleware/requireRole");

const router = express.Router();

/*
  Get analyses belonging to the
  authenticated user's organization.

  Admin + Analyst + Viewer
*/
router.get(
  "/",
  requireRole("admin", "analyst", "viewer"),
  getByOrganization
);

/*
  Create a new analysis.

  Admin + Analyst
*/
router.post(
  "/",
  requireRole("admin", "analyst"),
  create
);

/*
  Get one analysis.

  Admin + Analyst + Viewer
*/
router.get(
  "/:id",
  requireRole("admin", "analyst", "viewer"),
  getById
);

module.exports = router;