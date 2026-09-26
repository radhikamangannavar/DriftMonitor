const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  create,
  getByOrganization,
} = require("../controllers/datasetController");

const {
  uploadDataset,
} = require("../controllers/datasetUploadController");

const validateDataset =
  require("../middleware/validateDataset");


const router = express.Router();


/*
  Get all datasets belonging to
  the authenticated user's organization.
*/
router.get(
  "/",
  getByOrganization
);


/*
  Create dataset metadata.
*/
router.post(
  "/",
  create
);


/*
  Upload CSV dataset.
*/
router.post(
  "/upload",
  upload.single("file"),
  validateDataset,
  uploadDataset
);


module.exports = router;