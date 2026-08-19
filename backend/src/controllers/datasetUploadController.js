const fs = require("fs/promises");
const { createDataset } = require("../services/datasetService");

const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const { name, type, organizationId, uploadedBy } = req.body;

    const dataset = await createDataset({
      name,
      type,
      fileName: req.file.originalname,
      storagePath: req.file.path,
      organizationId,
      uploadedBy,
    });

    res.status(201).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
};

module.exports = {
  uploadDataset,
};