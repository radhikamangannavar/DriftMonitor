const Model = require("../models/Model");
const Organization = require("../models/Organization");
const Dataset = require("../models/Dataset");
const fs = require("fs");
const readline = require("readline");

const RISK_PROFILES = {
  conservative: {
    psi: {
      threshold: 0.3,
      binCount: 10,
    },
    ks: {
      alpha: 0.01,
    },
    chiSquare: {
      alpha: 0.01,
    },
  },

  standard: {
    psi: {
      threshold: 0.25,
      binCount: 10,
    },
    ks: {
      alpha: 0.05,
    },
    chiSquare: {
      alpha: 0.05,
    },
  },

  sensitive: {
    psi: {
      threshold: 0.1,
      binCount: 10,
    },
    ks: {
      alpha: 0.1,
    },
    chiSquare: {
      alpha: 0.1,
    },
  },
};

const createModel = async ({ name, organizationId, riskProfile }) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const selectedProfile = riskProfile || "standard";

  if (!RISK_PROFILES[selectedProfile]) {
    throw new Error(
      "Risk profile must be conservative, standard or sensitive"
    );
  }

  return await Model.create({
    name,
    organizationId,

    configuration: {
      riskProfile: selectedProfile,

      psi: {
        threshold:
          RISK_PROFILES[selectedProfile].psi.threshold,
        binCount:
          RISK_PROFILES[selectedProfile].psi.binCount,
      },

      ks: {
        alpha:
          RISK_PROFILES[selectedProfile].ks.alpha,
      },

      chiSquare: {
        alpha:
          RISK_PROFILES[selectedProfile].chiSquare.alpha,
      },

      featureImportance: {},
    },
  });
};

const getModelsByOrganization = async (organizationId) => {
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    throw new Error("Organization not found");
  }

  return await Model.find({ organizationId }).sort({
    createdAt: -1,
  });
};

const getModelById = async (modelId, organizationId) => {
  return await Model.findOne({
    _id: modelId,
    organizationId,
  });
};

const updateModelConfiguration = async ({
  modelId,
  organizationId,
  configuration,
}) => {
  const model = await Model.findOne({
    _id: modelId,
    organizationId,
  });

  if (!model) {
    throw new Error(
      "Model not found for this organization"
    );
  }

  const {
    riskProfile,
    psi,
    ks,
    chiSquare,
    featureImportance,
  } = configuration;

  if (
    riskProfile &&
    !RISK_PROFILES[riskProfile]
  ) {
    throw new Error(
      "Risk profile must be conservative, standard or sensitive"
    );
  }

  if (riskProfile) {
    model.configuration.riskProfile = riskProfile;

    model.configuration.psi.threshold =
      RISK_PROFILES[riskProfile].psi.threshold;

    model.configuration.psi.binCount =
      RISK_PROFILES[riskProfile].psi.binCount;

    model.configuration.ks.alpha =
      RISK_PROFILES[riskProfile].ks.alpha;

    model.configuration.chiSquare.alpha =
      RISK_PROFILES[riskProfile].chiSquare.alpha;
  }

  if (psi?.threshold !== undefined) {
    model.configuration.psi.threshold =
      psi.threshold;
  }

  if (psi?.binCount !== undefined) {
    model.configuration.psi.binCount =
      psi.binCount;
  }

  if (ks?.alpha !== undefined) {
    model.configuration.ks.alpha =
      ks.alpha;
  }

  if (chiSquare?.alpha !== undefined) {
    model.configuration.chiSquare.alpha =
      chiSquare.alpha;
  }

  if (featureImportance !== undefined) {
    model.configuration.featureImportance =
      featureImportance;
  }

  return await model.save();
};

function parseCsvHeader(header) {
  const features = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < header.length; i++) {
    const char = header[i];

    if (char === '"') {
      if (insideQuotes && header[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      features.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  features.push(current.trim());

  return features.filter(Boolean);
}

async function getModelFeatures(modelId, organizationId) {
  const model = await Model.findOne({
    _id: modelId,
    organizationId,
  });

  if (!model) {
    const error = new Error("Model not found");
    error.statusCode = 404;
    throw error;
  }

  const baselineDataset = await Dataset.findOne({
    modelId,
    organizationId,
    type: "baseline",
  }).sort({ createdAt: -1 });

  if (!baselineDataset) {
    const error = new Error(
      "Baseline dataset is required before configuring feature importance"
    );
    error.statusCode = 404;
    throw error;
  }

  const fileStream = fs.createReadStream(
    baselineDataset.storagePath
  );

  const reader = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let header = null;

  for await (const line of reader) {
    if (line.trim()) {
      header = line;
      break;
    }
  }

  reader.close();
  fileStream.close();

  if (!header) {
    const error = new Error("Baseline dataset is empty");
    error.statusCode = 400;
    throw error;
  }

  return parseCsvHeader(header);
}

module.exports = {
  createModel,
  getModelsByOrganization,
  getModelById,
  updateModelConfiguration,
  getModelFeatures,
  RISK_PROFILES,
};