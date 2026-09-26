const fs = require("fs/promises");

const {
  createDataset,
} = require("../services/datasetService");

const uploadDataset = async (req, res, next) => {
  try {
    // --------------------------------------------------
    // File validation
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    // --------------------------------------------------
    // Client-provided fields
    // --------------------------------------------------

    const {
      name,
      type,
      modelId,
    } = req.body;

    // --------------------------------------------------
    // Authenticated session fields
    //
    // NEVER trust organizationId or uploadedBy
    // from the client.
    // --------------------------------------------------

    const organizationId =
      req.session.organizationId;

    const uploadedBy =
      req.session.userId;

    // --------------------------------------------------
    // Create dataset
    // --------------------------------------------------

    const dataset = await createDataset({
      name,
      type,
      fileName: req.file.originalname,
      storagePath: req.file.path,
      organizationId,
      modelId,
      uploadedBy,
    });

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    // --------------------------------------------------
    // Cleanup uploaded file if database operation fails
    // --------------------------------------------------

    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
};

module.exports = {
  uploadDataset,
};