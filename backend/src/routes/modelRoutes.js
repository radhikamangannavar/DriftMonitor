const express = require("express");

const {
  create,
  getByOrganization,
  getById,
  updateConfiguration,
  getFeatures,
} = require("../controllers/modelController");

const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// Admin + Analyst
router.post(
  "/",
  requireAuth,
  requireRole("admin", "analyst"),
  create
);

// Admin + Analyst + Viewer
router.get(
  "/organization/:organizationId",
  requireAuth,
  requireRole("admin", "analyst", "viewer"),
  getByOrganization
);

// Admin + Analyst + Viewer
router.get(
  "/:modelId/features",
  requireAuth,
  requireRole("admin", "analyst", "viewer"),
  getFeatures
);

router.get(
  "/:modelId",
  requireAuth,
  requireRole("admin", "analyst", "viewer"),
  getById
);

// Admin + Analyst
router.patch(
  "/:modelId/configuration",
  requireAuth,
  requireRole("admin", "analyst"),
  updateConfiguration
);

module.exports = router;