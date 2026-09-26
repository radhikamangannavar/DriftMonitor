const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    configuration: {
      riskProfile: {
        type: String,
        enum: ["conservative", "standard", "sensitive"],
        default: "standard",
      },

      psi: {
        threshold: {
          type: Number,
          min: 0.01,
          max: 1,
          default: 0.25,
        },

        binCount: {
          type: Number,
          min: 2,
          max: 20,
          default: 10,
        },
      },

      ks: {
        alpha: {
          type: Number,
          min: 0.001,
          max: 0.2,
          default: 0.05,
        },
      },

      chiSquare: {
        alpha: {
          type: Number,
          min: 0.001,
          max: 0.2,
          default: 0.05,
        },
      },

      featureImportance: {
        type: Map,
        of: {
          type: String,
          enum: ["LOW", "MEDIUM", "HIGH"],
        },
        default: {},
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Model", modelSchema);