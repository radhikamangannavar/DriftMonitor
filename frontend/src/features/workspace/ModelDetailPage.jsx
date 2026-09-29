import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Database,
  Gauge,
  Settings2,
  TriangleAlert,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../services/api";

function ModelDetailPage() {
  const { modelId } = useParams();

  const [model, setModel] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    sessionStorage.getItem("driftmonitor_user") || "null"
  );

  const isViewer = user?.role === "viewer";

  useEffect(() => {
    async function loadModel() {
      if (!modelId) {
        setError("Model ID is missing.");
        setLoading(false);
        return;
      }

      if (!user?.organizationId) {
        setError("Organization information is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        // --------------------------------------------------
        // LOAD MODEL
        // --------------------------------------------------

        const modelResult = await api.get(
          `/models/${modelId}?organizationId=${user.organizationId}`
        );

        setModel(modelResult.data);

        // --------------------------------------------------
        // LOAD ANALYSES
        // --------------------------------------------------

        const analysesResult = await api.get("/analyses");

        const allAnalyses = Array.isArray(analysesResult.data)
          ? analysesResult.data
          : [];

        const modelAnalyses = allAnalyses
          .filter((analysis) => {
            const analysisModelId =
              analysis?.modelId?._id ??
              analysis?.modelId;

            return String(analysisModelId) === String(modelId);
          })
          .sort(
            (a, b) =>
              new Date(b?.createdAt || 0) -
              new Date(a?.createdAt || 0)
          );

        setAnalysisHistory(modelAnalyses);
        setLatestAnalysis(modelAnalyses[0] || null);

        // --------------------------------------------------
        // LOAD DATASETS
        // Viewers do not have dataset access.
        // --------------------------------------------------

        if (!isViewer) {
          const datasetsResult = await api.get("/datasets");

          const modelDatasets = (
            datasetsResult.data || []
          ).filter((dataset) => {
            const datasetModelId =
              typeof dataset.modelId === "object"
                ? dataset.modelId?._id
                : dataset.modelId;

            return (
              String(datasetModelId) ===
              String(modelId)
            );
          });

          setDatasets(modelDatasets);
        } else {
          setDatasets([]);
        }
      } catch (err) {
        setError(
          err.message || "Unable to load model."
        );
      } finally {
        setLoading(false);
      }
    }

    loadModel();
  }, [modelId, user?.organizationId, isViewer]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="detail-loading">
        Loading model...
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

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

  // --------------------------------------------------
  // DERIVED DATA
  // --------------------------------------------------

  const configuration =
    model.configuration || {};

  const riskProfile =
    configuration.riskProfile ||
    "standard";

  const affectedCoverage =
    latestAnalysis?.affectedCoverage;

  const health =
    latestAnalysis?.health;

  const confidence =
    latestAnalysis?.overallConfidence;

  const recommendation =
    latestAnalysis?.recommendation;

  const baselineDataset =
    datasets.find(
      (dataset) =>
        dataset.type === "baseline"
    );

  const currentDataset =
    datasets.find(
      (dataset) =>
        dataset.type === "current"
    );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

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

          <h1>{model.name}</h1>

          <p>
            {capitalize(riskProfile)}
            {" "}
            monitoring profile
            <span> · </span>
            Created{" "}
            {formatDate(model.createdAt)}
          </p>
        </div>

        {!isViewer && (
          <Link
            to={`/app/models/${model._id}/configuration`}
            className="detail-action"
          >
            <Settings2 size={14} />
            Configuration
          </Link>
        )}
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
            {health || "No analysis"}
          </div>

          <p>
            {latestAnalysis
              ? `${formatCoverage(
                  affectedCoverage
                )} of monitored features affected`
              : "Run an analysis after uploading baseline and current datasets."}
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

          {latestAnalysis && (
            <div>
              <span>
                CONFIDENCE
              </span>

              <strong>
                {confidence || "—"}
              </strong>
            </div>
          )}

        </div>
      </section>

      {/* ==================================================
          LATEST ANALYSIS
      ================================================== */}

      {latestAnalysis && (
        <section className="detail-section">

          <div className="detail-section-heading">

            <div>
              <div className="overview-kicker">
                LATEST ANALYSIS
              </div>

              <h2>
                Monitoring result
              </h2>
            </div>

            <Link
              to={`/app/analyses/${latestAnalysis._id}`}
              className="section-action"
            >
              View analysis
              <ArrowUpRight size={13} />
            </Link>

          </div>

          <Link
            to={`/app/analyses/${latestAnalysis._id}`}
            className="analysis-summary"
          >

            <div className="analysis-summary-main">

              <div className="analysis-empty-mark">
                <Gauge size={19} />
              </div>

              <div>
                <h3>
                  Analysis completed
                </h3>

                <p>
                  {latestAnalysis.status ||
                    "Completed"}
                  {" · "}
                  {formatDate(
                    latestAnalysis.createdAt
                  )}
                </p>
              </div>

            </div>

            <div className="analysis-summary-metrics">

              <div>
                <span>
                  HEALTH
                </span>

                <strong>
                  {health || "—"}
                </strong>
              </div>

              <div>
                <span>
                  COVERAGE
                </span>

                <strong>
                  {formatCoverage(
                    affectedCoverage
                  )}
                </strong>
              </div>

              <div>
                <span>
                  RECOMMENDATION
                </span>

                <strong>
                  {recommendation || "—"}
                </strong>
              </div>

              <ChevronRight size={16} />

            </div>

          </Link>

        </section>
      )}

      {/* ==================================================
          ANALYSIS HISTORY
      ================================================== */}

      {analysisHistory.length > 0 && (
        <section className="detail-section">

          <div className="detail-section-heading">

            <div>
              <div className="overview-kicker">
                HISTORY
              </div>

              <h2>
                Analysis history
              </h2>
            </div>

            <Link
              to="/app/analyses"
              className="section-action"
            >
              View all
              <ArrowUpRight size={13} />
            </Link>

          </div>

          <div className="analysis-history">

            {analysisHistory
              .slice(0, 5)
              .map((analysis) => (
                <Link
                  key={analysis._id}
                  to={`/app/analyses/${analysis._id}`}
                  className="analysis-history-row"
                >

                  <div className="analysis-history-main">

                    <div className="analysis-history-icon">
                      <Gauge size={16} />
                    </div>

                    <div>
                      <strong>
                        Drift analysis
                      </strong>

                      <span>
                        {formatDate(
                          analysis.createdAt
                        )}
                      </span>
                    </div>

                  </div>

                  <div className="analysis-history-meta">

                    <span>
                      {analysis.health || "—"}
                    </span>

                    <span>
                      {formatCoverage(
                        analysis.affectedCoverage
                      )}
                    </span>

                    <ChevronRight size={15} />

                  </div>

                </Link>
              ))}

          </div>

        </section>
      )}

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

          {!isViewer && (
            <Link
              to={`/app/models/${model._id}/configuration`}
              className="section-action"
            >
              Edit
              <ArrowUpRight size={13} />
            </Link>
          )}

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
              Object.keys(
                configuration.featureImportance
              ).length > 0
                ? "Configured"
                : "Not configured"
            }
          />

        </div>

      </section>

      {/* ==================================================
          DATASETS
      ================================================== */}

      {!isViewer && (
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

            <DatasetSummaryItem
              type="baseline"
              dataset={baselineDataset}
            />

            <DatasetSummaryItem
              type="current"
              dataset={currentDataset}
            />

          </div>

        </section>
      )}

    </div>
  );
}

/* ==================================================
   DATASET SUMMARY ITEM
================================================== */

function DatasetSummaryItem({
  type,
  dataset,
}) {
  const isBaseline =
    type === "baseline";

  return (
    <div className="dataset-summary-item">

      <div className="dataset-summary-icon">
        {isBaseline ? (
          <Database size={16} />
        ) : (
          <Activity size={16} />
        )}
      </div>

      <div>

        <span>
          {isBaseline
            ? "BASELINE"
            : "CURRENT"}
        </span>

        <strong>
          {dataset?.name ||
            (isBaseline
              ? "No baseline dataset"
              : "No current dataset")}
        </strong>

        <small>
          {dataset
            ? isBaseline
              ? "Reference distribution"
              : "Production distribution"
            : isBaseline
            ? "Upload a baseline dataset"
            : "Upload a current dataset"}
        </small>

      </div>

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

function formatCoverage(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

export default ModelDetailPage;