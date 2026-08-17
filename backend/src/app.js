const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");
const datasetRoutes = require("./routes/datasetRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoutes);
app.use("/api/organizations", organizationRoutes);
app.use(errorHandler);
app.use("/api/users", userRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/analyses", analysisRoutes);

module.exports = app;
