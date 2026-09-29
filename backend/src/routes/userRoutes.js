const express = require("express");

const {
  create,
  getMembers,
  createMember,
  updateRole,
  remove,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", create);

router.get("/members", getMembers);

router.post("/members", createMember);

router.patch("/members/:userId/role", updateRole);

router.delete("/members/:userId", remove);

module.exports = router;