const fs = require("fs/promises");

const validateDataset = async (req, res, next) => {
  const {
    name,
    type,
    modelId,
  } = req.body;

  const organizationId =
    req.session.organizationId;

  const uploadedBy =
    req.session.userId;

  if (
    !name ||
    !type ||
    !organizationId ||
    !modelId ||
    !uploadedBy
  ) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(400).json({
      success: false,
      message:
        "Name, type, modelId and authenticated session are required",
    });
  }

  if (!["baseline", "current"].includes(type)) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(400).json({
      success: false,
      message:
        "Dataset type must be baseline or current",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "CSV file is required",
    });
  }

  next();
};

module.exports = validateDataset;