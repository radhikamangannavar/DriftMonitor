const express = require("express");

const {
  create,
  getById,
  getByOrganization,
} = require("../controllers/analysisController");

const router = express.Router();


/*
  Get analyses belonging to the
  authenticated user's organization.
*/
router.get(
  "/",
  getByOrganization
);


/*
  Create a new analysis.
*/
router.post(
  "/",
  create
);


/*
  Get one analysis.
*/
router.get(
  "/:id",
  getById
);


module.exports = router;