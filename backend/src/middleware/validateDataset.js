const fs = require("fs/promises");

const validateDataset = async (req, res, next) => {
  const { name, type, organizationId, uploadedBy } = req.body;

  if (!name || !type || !organizationId || !uploadedBy) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(400).json({
      success: false,
      message: "Name, type, organizationId and uploadedBy are required",
    });
  }

  if (!["baseline", "current"].includes(type)) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    return res.status(400).json({
      success: false,
      message: "Dataset type must be baseline or current",
    });
  }

  next();
};

module.exports = validateDataset;