const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { create } = require("../controllers/datasetController");
const { uploadDataset } = require("../controllers/datasetUploadController");
const validateDataset = require("../middleware/validateDataset");
const router = express.Router();

router.post("/", create);

router.post(
  "/upload",
  upload.single("file"),
  validateDataset,
  uploadDataset
);

module.exports = router;