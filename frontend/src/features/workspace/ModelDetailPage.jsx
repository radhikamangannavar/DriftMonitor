import { useEffect, useState } from "react";

import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  Gauge,
  Settings2,
  TriangleAlert,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { api } from "../../services/api";

function ModelDetailPage() {
  const { modelId } = useParams();

  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    sessionStorage.getItem(
      "driftmonitor_user"
    ) || "null"
  );

  useEffect(() => {
    async function loadModel() {
      if (!modelId) {
        setError("Model ID is missing.");
        setLoading(false);
        return;
      }

      if (!user?.organizationId) {
        setError(
          "Organization information is missing."
        );
        setLoading(false);
        return;
      }

      try {
        const result = await api.get(
          `/models/${modelId}?organizationId=${user.organizationId}`
        );

        setModel(result.data);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load model."
        );
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, [
    modelId,
    user?.organizationId,
  ]);

  if (loading) {
    return (
      <div className="detail-loading">
        Loading model...
      </div>
    );
  }

  if (error) {
    return (
      <div className="model-detail-page">

        <Link
          to="/app/models"
          className="page-back"
        >
          <ArrowLeft size={14} />
          Models
        </Link>

        <div className="detail-error">
          <TriangleAlert size={16} />

          <span>{error}</span>
        </div>

      </div>
    );
  }

  if (!model) {
    return null;
  }

  const configuration =
    model.configuration || {};

  const riskProfile =
    configuration.riskProfile ||
    "standard";

  return (
    <div className="model-detail-page">

      {/* ==================================================
          BACK
      ================================================== */}

      <Link
        to="/app/models"
        className="page-back"
      >
        <ArrowLeft size={14} />
        Models
      </Link>


      {/* ==================================================
          MODEL INTRO
      ================================================== */}

      <section className="model-detail-intro">

        <div>

          <div className="overview-kicker">
            MODEL
          </div>

          <h1>
            {model.name}
          </h1>

          <p>
            {riskProfile} monitoring profile
            <span> · </span>
            Created{" "}
            {formatDate(model.createdAt)}
          </p>

        </div>


        <Link
          to={`/app/models/${model._id}/configuration`}
          className="detail-action"
        >
          <Settings2 size={14} />
          Configuration
        </Link>

      </section>


      {/* ==================================================
          HEALTH
      ================================================== */}

      <section className="model-health">

        <div className="model-health-main">

          <div className="overview-kicker">
            MODEL HEALTH
          </div>

          <div className="model-health-value">
            <span className="health-dot" />

            No analysis
          </div>

          <p>
            Run an analysis after uploading
            baseline and current datasets.
          </p>

        </div>


        <div className="model-health-side">

          <div>
            <span>
              RISK PROFILE
            </span>

            <strong>
              {capitalize(riskProfile)}
            </strong>
          </div>

          <div>
            <span>
              PSI THRESHOLD
            </span>

            <strong>
              {configuration.psi?.threshold ??
                "—"}
            </strong>
          </div>

        </div>

      </section>


      {/* ==================================================
          CONFIGURATION
      ================================================== */}

      <section className="detail-section">

        <div className="detail-section-heading">

          <div>
            <div className="overview-kicker">
              MONITORING
            </div>

            <h2>
              Configuration
            </h2>
          </div>

          <Link
            to={`/app/models/${model._id}/configuration`}
            className="section-action"
          >
            Edit
            <ArrowUpRight size={13} />
          </Link>

        </div>


        <div className="configuration-grid">

          <ConfigurationItem
            label="Risk profile"
            value={capitalize(riskProfile)}
          />

          <ConfigurationItem
            label="PSI threshold"
            value={
              configuration.psi?.threshold ??
              "—"
            }
          />

          <ConfigurationItem
            label="PSI bin count"
            value={
              configuration.psi?.binCount ??
              "—"
            }
          />

          <ConfigurationItem
            label="KS alpha"
            value={
              configuration.ks?.alpha ??
              "—"
            }
          />

          <ConfigurationItem
            label="Chi-square alpha"
            value={
              configuration.chiSquare?.alpha ??
              "—"
            }
          />

          <ConfigurationItem
  label="Feature importance"
  value={
    configuration.featureImportance &&
    Object.keys(configuration.featureImportance).length > 0
      ? "Configured"
      : "Not configured"
  }
/>
        

        </div>

      </section>


      {/* ==================================================
          DATASETS
      ================================================== */}

      <section className="detail-section">

        <div className="detail-section-heading">

          <div>
            <div className="overview-kicker">
              DATA
            </div>

            <h2>
              Datasets
            </h2>
          </div>

          <Link
            to="/app/datasets"
            className="section-action"
          >
            Manage
            <ArrowUpRight size={13} />
          </Link>

        </div>


        <div className="dataset-summary">

          <div className="dataset-summary-item">

            <div className="dataset-summary-icon">
              <Database size={16} />
            </div>

            <div>
              <span>
                BASELINE
              </span>

              <strong>
                Dataset required
              </strong>

              <small>
                Reference distribution
              </small>
            </div>

          </div>


          <div className="dataset-summary-item">

            <div className="dataset-summary-icon">
              <Activity size={16} />
            </div>

            <div>
              <span>
                CURRENT
              </span>

              <strong>
                Dataset required
              </strong>

              <small>
                Production distribution
              </small>
            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          ANALYSIS
      ================================================== */}

      <section className="detail-section detail-analysis">

        <div className="detail-section-heading">

          <div>
            <div className="overview-kicker">
              ANALYSIS
            </div>

            <h2>
              Drift analysis
            </h2>
          </div>

          <Link
            to="/app/analyses"
            className="section-action"
          >
            View analyses
            <ArrowUpRight size={13} />
          </Link>

        </div>


        <div className="analysis-empty">

          <div className="analysis-empty-mark">
            <Gauge size={19} />
          </div>

          <div>

            <h3>
              No analysis attached yet.
            </h3>

            <p>
              Upload both dataset types
              to compare production behavior
              against the baseline.
            </p>

          </div>

          <ChevronRight size={16} />

        </div>

      </section>

    </div>
  );
}


/* ==================================================
   CONFIGURATION ITEM
================================================== */

function ConfigurationItem({
  label,
  value,
}) {
  return (
    <div className="configuration-item">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* ==================================================
   HELPERS
================================================== */

function capitalize(value) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


export default ModelDetailPage;