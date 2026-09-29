import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Gauge,
  Plus,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";

function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    sessionStorage.getItem("driftmonitor_user") || "null"
  );

  const organizationId = user?.organizationId;
  const isViewer = user?.role === "viewer";

  useEffect(() => {
    async function loadModels() {
      if (!organizationId) {
        setError("Organization information is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await api.get(
          `/models/organization/${organizationId}`
        );

        setModels(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err.message || "Unable to load models.");
        setModels([]);
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, [organizationId]);

  return (
    <div className="models-page">

      {/* INTRO */}
      <section className="models-intro">
        <div>
          <div className="overview-kicker">MODELS</div>

          <h1>
            Your models,
            <br />
            under watch.
          </h1>

          <p>
            Models connected to your DriftMonitor
            monitoring configuration.
          </p>
        </div>

        {!isViewer && (
          <Link
            to="/app/models/new"
            className="models-create-button"
          >
            <Plus size={14} />
            New model
          </Link>
        )}
      </section>

      {/* ERROR */}
      {error && (
        <div className="overview-error">
          <TriangleAlert size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* SUMMARY */}
      <div className="models-summary">
        <span>{loading ? "—" : models.length}</span>

        <small>
          {models.length === 1
            ? "model in your organization"
            : "models in your organization"}
        </small>
      </div>

      {/* MODEL LIST */}
      <section className="models-list-section">

        <div className="models-list-header">
          <span>MODEL</span>
          <span>MONITORING</span>
          <span />
        </div>

        {loading && (
          <div className="models-loading">
            Loading models...
          </div>
        )}

        {!loading && error && (
          <div className="models-empty">
            <h2>Unable to load models.</h2>

            <p>
              Check your workspace connection and try
              again.
            </p>
          </div>
        )}

        {!loading && !error && models.length === 0 && (
          <div className="models-empty">
            <h2>Nothing here yet.</h2>

            <p>
              {isViewer
                ? "No models are available in your organization yet."
                : "Create your first model and connect it to DriftMonitor."}
            </p>

            {!isViewer && (
              <Link
                to="/app/models/new"
                className="models-empty-button"
              >
                Create model
                <ArrowUpRight size={14} />
              </Link>
            )}
          </div>
        )}

        {!loading &&
          !error &&
          models.length > 0 &&
          models.map((model) => {
            const configuration = model.configuration || {};

            const riskProfile =
              configuration.riskProfile || "standard";

            const psiThreshold =
              configuration.psi?.threshold;

            return (
              <Link
                key={model._id}
                to={`/app/models/${model._id}`}
                className="models-row"
              >
                <div className="models-row-name">

                  <div className="models-row-title">
                    <Gauge size={16} />

                    <strong>{model.name}</strong>
                  </div>

                  <span>
                    {riskProfile} risk profile
                  </span>

                </div>

                <div className="models-row-monitoring">

                  <span className="models-risk">
                    {riskProfile}
                  </span>

                  <span className="models-psi">
                    PSI
                    <strong>
                      {psiThreshold ?? "—"}
                    </strong>
                  </span>

                </div>

                <ChevronRight
                  size={16}
                  className="models-row-arrow"
                />
              </Link>
            );
          })}

      </section>
    </div>
  );
}

export default ModelsPage;