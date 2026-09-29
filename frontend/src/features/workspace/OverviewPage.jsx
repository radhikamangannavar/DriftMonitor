import { useEffect, useState } from "react";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Gauge,
  TriangleAlert,
} from "lucide-react";

import { Link } from "react-router-dom";

import { api } from "../../services/api";

function OverviewPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    sessionStorage.getItem("driftmonitor_user") || "null"
  );
const canCreateModel =
  user?.role === "admin" || user?.role === "analyst";
  
  useEffect(() => {
    async function loadModels() {
      if (!user?.organizationId) {
        setError("Organization information is missing.");
        setLoading(false);
        return;
      }

      try {
        const result = await api.get(
          `/models/organization/${user.organizationId}`
        );

        setModels(result.data || []);
      } catch (err) {
        setError(
          err.message || "Unable to load models."
        );
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, [user?.organizationId]);

  const sensitiveModels = models.filter(
    (model) =>
      model.configuration?.riskProfile === "sensitive"
  ).length;

  const configuredModels = models.filter(
    (model) => model.configuration
  ).length;

  return (
    <div className="overview">

      {/* ==================================================
          INTRO
      ================================================== */}

      <section className="overview-intro">

        <div>
          <div className="overview-kicker">
            OVERVIEW
          </div>

          <h1>
            Know what's
            <br />
            happening.
          </h1>

          <p>
            A clear view of model health,
            data movement, and statistical
            evidence across your workspace.
          </p>
        </div>

        <div className="overview-date">
          <Activity size={14} />
          Live workspace
        </div>

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="overview-error">
          <TriangleAlert size={15} />
          <span>{error}</span>
        </div>
      )}


      {/* ==================================================
          METRICS
      ================================================== */}

      <section className="overview-metrics">

        {/* MONITORED MODELS */}

        <div className="metric-card">

          <div className="metric-top">
            <span>
              MONITORED MODELS
            </span>

            <Gauge size={15} />
          </div>

          <strong>
            {loading ? "—" : models.length}
          </strong>

          <small>
            Models in your organization
          </small>

        </div>


        {/* CONFIGURED */}

        <div className="metric-card">

          <div className="metric-top">
            <span>
              CONFIGURED
            </span>

            <CheckCircle2 size={15} />
          </div>

          <strong>
            {loading ? "—" : configuredModels}
          </strong>

          <small>
            With active monitoring configuration
          </small>

        </div>


        {/* SENSITIVE CONFIGURATION */}

        <div className="metric-card">

          <div className="metric-top">
            <span>
              RISK CONFIGURATION
            </span>

            <Activity size={15} />
          </div>

          <strong>
            {loading ? "—" : sensitiveModels}
          </strong>

          <small>
            Models using sensitive monitoring
          </small>

        </div>

      </section>


      {/* ==================================================
          MODELS
      ================================================== */}

      <section className="overview-section">

        <div className="overview-section-header">

          <div>
            <div className="overview-kicker">
              MODELS
            </div>

            <h2>
              Your monitored models
            </h2>
          </div>

          <Link
            to="/app/models"
            className="overview-link"
          >
            View all
            <ArrowUpRight size={14} />
          </Link>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="overview-loading">
            Loading models...
          </div>
        )}


        {/* ERROR / NO MODELS */}

        {!loading &&
          !error &&
          models.length === 0 && (
            <div className="empty-state">
              <h3>
  No models yet
</h3>

<p>
  {canCreateModel
    ? "Create your first model to begin monitoring production behavior."
    : "Models created in your organization will appear here for monitoring."}
</p>

              {canCreateModel && (
  <Link
    to="/app/models/new"
    className="empty-state-action"
  >
    Add a model
    <ArrowUpRight size={14} />
  </Link>
)}

            </div>
          )}


        {/* MODELS */}

        {!loading &&
          models.length > 0 && (
            <div className="model-list">

              {models
                .slice(0, 5)
                .map((model) => (

                  <Link
                    key={model._id}
                    to={`/app/models/${model._id}`}
                    className="model-row"
                  >

                    <div className="model-row-main">

                      <strong>
                        {model.name}
                      </strong>

                      <span>
                        {model.configuration
                          ?.riskProfile ||
                          "standard"}{" "}
                        risk profile
                      </span>

                    </div>


                    <div className="model-row-config">

                      <span>
                        PSI
                      </span>

                      <strong>
                        {model.configuration
                          ?.psi
                          ?.threshold ??
                          "—"}
                      </strong>

                    </div>


                    <ChevronRight
                      size={15}
                      className="model-row-arrow"
                    />

                  </Link>

                ))}

            </div>
          )}

      </section>


      {/* ==================================================
          DATA + ANALYSIS
      ================================================== */}

      <section className="overview-bottom">

        <Link
          to="/app/datasets"
          className="overview-feature"
        >

          <div>

            <div className="overview-kicker">
              DATA
            </div>

            <h3>
              Dataset management
            </h3>

            <p>
              Upload baseline and current
              datasets for your models.
            </p>

          </div>

          <ArrowUpRight size={15} />

        </Link>


        <Link
          to="/app/analyses"
          className="overview-feature"
        >

          <div>

            <div className="overview-kicker">
              ANALYSIS
            </div>

            <h3>
              Drift analysis
            </h3>

            <p>
              Run statistical analysis and
              inspect model health.
            </p>

          </div>

          <ArrowUpRight size={15} />

        </Link>

      </section>

    </div>
  );
}

export default OverviewPage;