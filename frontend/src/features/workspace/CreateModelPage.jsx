import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  TriangleAlert,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../../services/api";

const RISK_PROFILES = [
  {
    id: "conservative",
    title: "Conservative",
    description:
      "Higher tolerance for drift before raising concern.",
    psi: "0.30",
    alpha: "0.01",
  },
  {
    id: "standard",
    title: "Standard",
    description:
      "Balanced monitoring suitable for most models.",
    psi: "0.25",
    alpha: "0.05",
  },
  {
    id: "sensitive",
    title: "Sensitive",
    description:
      "Detect smaller changes with greater sensitivity.",
    psi: "0.10",
    alpha: "0.10",
  },
];

function CreateModelPage() {
  const navigate = useNavigate();

  const user = JSON.parse(
    sessionStorage.getItem("driftmonitor_user") || "null"
  );

  const [name, setName] = useState("");
  const [riskProfile, setRiskProfile] =
    useState("standard");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Model name is required.");
      return;
    }

    if (!user?.organizationId) {
      setError(
        "Organization information is missing."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await api.post("/models", {
        name: trimmedName,
        organizationId: user.organizationId,
        riskProfile,
      });

      const model = result.data;

      navigate(`/app/models/${model._id}`);
    } catch (err) {
      setError(
        err.message || "Unable to create model."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-model-page">

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
          INTRO
      ================================================== */}

      <section className="create-model-intro">

        <div className="overview-kicker">
          NEW MODEL
        </div>

        <h1>
          Put a model
          <br />
          under watch.
        </h1>

        <p>
          Add a production model and choose
          how sensitive its drift monitoring
          should be.
        </p>

      </section>


      {/* ==================================================
          FORM
      ================================================== */}

      <form
        className="create-model-form"
        onSubmit={handleSubmit}
      >

        {/* MODEL NAME */}

        <section className="form-section">

          <div className="form-section-heading">

            <span>
              01
            </span>

            <div>
              <h2>
                Model identity
              </h2>

              <p>
                Give this model a recognizable
                name for your workspace.
              </p>
            </div>

          </div>


          <div className="form-field">

            <label htmlFor="model-name">
              Model name
            </label>

            <input
              id="model-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Customer Churn"
              autoComplete="off"
              disabled={loading}
            />

          </div>

        </section>


        {/* RISK PROFILE */}

        <section className="form-section">

          <div className="form-section-heading">

            <span>
              02
            </span>

            <div>
              <h2>
                Monitoring sensitivity
              </h2>

              <p>
                Choose the default statistical
                thresholds for this model.
              </p>
            </div>

          </div>


          <div className="risk-profile-list">

            {RISK_PROFILES.map((profile) => {

              const selected =
                riskProfile === profile.id;

              return (
                <button
                  key={profile.id}
                  type="button"
                  className={`risk-profile ${
                    selected
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setRiskProfile(
                      profile.id
                    )
                  }
                  disabled={loading}
                >

                  <div className="risk-profile-left">

                    <div className="risk-profile-check">
                      {selected && (
                        <Check size={11} />
                      )}
                    </div>

                    <div>

                      <strong>
                        {profile.title}
                      </strong>

                      <p>
                        {profile.description}
                      </p>

                    </div>

                  </div>


                  <div className="risk-profile-values">

                    <span>
                      PSI
                      <strong>
                        {profile.psi}
                      </strong>
                    </span>

                    <span>
                      α
                      <strong>
                        {profile.alpha}
                      </strong>
                    </span>

                  </div>

                </button>
              );
            })}

          </div>

        </section>


        {/* ERROR */}

        {error && (
          <div className="overview-error">

            <TriangleAlert size={15} />

            <span>
              {error}
            </span>

          </div>
        )}


        {/* SUBMIT */}

        <div className="create-model-submit">

          <div>
            <span>
              READY TO MONITOR
            </span>

            <p>
              Configuration can be adjusted
              after the model is created.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create model"}

            {!loading && (
              <ArrowUpRight size={14} />
            )}
          </button>

        </div>

      </form>

    </div>
  );
}

export default CreateModelPage;