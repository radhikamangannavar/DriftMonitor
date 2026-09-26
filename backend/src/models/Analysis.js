const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model",
      required: true,
    },
    baselineDatasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },

    currentDatasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    health: {
      type: String,
      enum: ["HEALTHY", "LOW", "MEDIUM", "HIGH", "CRITICAL"],
    },

    recommendation: {
      type: String,
      enum: [
        "Monitor",
        "Investigate",
        "Validate Data",
        "Segment Analysis",
        "Performance Review",
        "Retraining Review",
      ],
    },
    report: {
  type: mongoose.Schema.Types.Mixed,
},

    overallConfidence: {
  type: String,
  enum: ["LOW", "MEDIUM", "HIGH"],
},

    affectedCoverage: {
      type: Number,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);