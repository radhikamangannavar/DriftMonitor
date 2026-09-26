const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const healthRoutes = require("./routes/healthRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const userRoutes = require("./routes/userRoutes");
const datasetRoutes = require("./routes/datasetRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const modelRoutes = require("./routes/modelRoutes");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middleware/requireAuth");
const requireRole = require("./middleware/requireRole");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --------------------------------------------------
// Global middleware
// --------------------------------------------------

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// --------------------------------------------------
// Session authentication
// --------------------------------------------------

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),

    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);
// Admin only
app.use(
  "/api/organizations",
  requireAuth,
  requireRole("admin"),
  organizationRoutes
);

app.use(
  "/api/users",
  requireAuth,
  requireRole("admin"),
  userRoutes
);

// Admin + Analyst
app.use(
  "/api/models",
  modelRoutes
);

app.use(
  "/api/datasets",
  requireAuth,
  requireRole("admin", "analyst"),
  datasetRoutes
);

app.use(
  "/api/analyses",
  requireAuth,
  requireRole("admin", "analyst"),
  analysisRoutes
);
// --------------------------------------------------
// Error handler
// MUST remain after all routes
// --------------------------------------------------

app.use(errorHandler);

module.exports = app;