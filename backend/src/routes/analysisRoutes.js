const express = require("express");
const {
  create,
  getById,
} = require("../controllers/analysisController");

const router = express.Router();

router.post("/", create);
router.get("/:id", getById);

module.exports = router;