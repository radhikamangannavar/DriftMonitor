import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Save,
  TriangleAlert,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { api } from "../../services/api";


const IMPORTANCE_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
];


function ModelConfigurationPage() {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(
    sessionStorage.getItem(
      "driftmonitor_user"
    ) || "null"
  );

  const [model, setModel] = useState(null);
  const [features, setFeatures] = useState([]);

  const [riskProfile, setRiskProfile] =
    useState("standard");

  const [featureImportance, setFeatureImportance] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  useEffect(() => {
    async function loadConfiguration() {
      if (!modelId) {
        setError("Model ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const [modelResult, featureResult] =
          await Promise.all([
            api.get(
              `/models/${modelId}?organizationId=${user.organizationId}`
            ),

            api.get(
              `/models/${modelId}/features`
            ),
          ]);

        const loadedModel =
          modelResult.data;

        setModel(loadedModel);

        const configuration =
          loadedModel.configuration || {};

        setRiskProfile(
          configuration.riskProfile ||
            "standard"
        );

        setFeatureImportance(
          configuration.featureImportance ||
            {}
        );

        setFeatures(
          featureResult.features || []
        );
      } catch (err) {
        setError(
          err.message ||
            "Unable to load model configuration."
        );
      } finally {
        setLoading(false);
      }
    }

    if (!user?.organizationId) {
      setError(
        "Organization information is missing."
      );
      setLoading(false);
      return;
    }

    loadConfiguration();
  }, [
    modelId,
    user?.organizationId,
  ]);


  function handleImportanceChange(
    feature,
    value
  ) {
    setFeatureImportance((current) => ({
      ...current,
      [feature]: value,
    }));
  }


  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/models/${modelId}/configuration`,
        {
          organizationId:
            user.organizationId,

          configuration: {
            riskProfile,

            featureImportance,
          },
        }
      );

      setSuccess(
        "Configuration saved successfully."
      );

      setTimeout(() => {
        navigate(
          `/app/models/${modelId}`
        );
      }, 700);
    } catch (err) {
      setError(
        err.message ||
          "Unable to save configuration."
      );
    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="detail-loading">
        Loading configuration...
      </div>
    );
  }


  if (error && !model) {
    return (
      <div className="model-detail-page">

        <Link
          to={`/app/models/${modelId}`}
          className="page-back"
        >
          <ArrowLeft size={14} />
          Model
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


  return (
    <div className="model-configuration-page">

      <Link
        to={`/app/models/${modelId}`}
        className="page-back"
      >
        <ArrowLeft size={14} />
        {model.name}
      </Link>


      <section className="model-configuration-intro">

        <div className="overview-kicker">
          MODEL CONFIGURATION
        </div>

        <h1>
          Configure monitoring
        </h1>

        <p>
          Define how{" "}
          <strong>{model.name}</strong>{" "}
          should prioritize detected
          data drift.
        </p>

      </section>


      {error && (
        <div className="configuration-message error">
          <TriangleAlert size={15} />
          <span>{error}</span>
        </div>
      )}


      {success && (
        <div className="configuration-message success">
          <Check size={15} />
          <span>{success}</span>
        </div>
      )}


      {/* ==================================================
          RISK PROFILE
      ================================================== */}

      <section className="configuration-form-section">

        <div className="configuration-form-heading">

          <span>01</span>

          <div>
            <h2>
              Risk profile
            </h2>

            <p>
              Choose the monitoring
              sensitivity for this model.
            </p>
          </div>

        </div>


        <div className="configuration-risk-list">

          {[
            {
              value: "conservative",
              title: "Conservative",
              description:
                "Stricter thresholds with fewer false alarms.",
            },
            {
              value: "standard",
              title: "Standard",
              description:
                "Balanced monitoring for general use.",
            },
            {
              value: "sensitive",
              title: "Sensitive",
              description:
                "More sensitive detection of potential drift.",
            },
          ].map((profile) => (

            <button
              key={profile.value}
              type="button"
              className={`configuration-risk ${
                riskProfile ===
                profile.value
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setRiskProfile(
                  profile.value
                )
              }
            >

              <div className="configuration-risk-left">

                <span className="configuration-risk-check">
                  {riskProfile ===
                    profile.value && (
                    <Check size={11} />
                  )}
                </span>

                <div>
                  <strong>
                    {profile.title}
                  </strong>

                  <p>
                    {profile.description}
                  </p>
                </div>

              </div>

            </button>

          ))}

        </div>

      </section>


      {/* ==================================================
          FEATURE IMPORTANCE
      ================================================== */}

      <section className="configuration-form-section">

        <div className="configuration-form-heading">

          <span>02</span>

          <div>
            <h2>
              Feature importance
            </h2>

            <p>
              Tell DriftMonitor which
              features deserve more
              attention when evaluating
              drift.
            </p>
          </div>

        </div>


        <div className="feature-importance-list">

          {features.map((feature) => {

            const selected =
              featureImportance[
                feature
              ] || "";

            return (
              <div
                className="feature-importance-row"
                key={feature}
              >

                <div className="feature-importance-name">

                  <span>
                    FEATURE
                  </span>

                  <strong>
                    {feature}
                  </strong>

                </div>


                <div className="feature-importance-control">

                  <select
                    value={selected}
                    onChange={(event) =>
                      handleImportanceChange(
                        feature,
                        event.target.value
                      )
                    }
                  >

                    <option value="">
                      Not configured
                    </option>

                    {IMPORTANCE_LEVELS.map(
                      (level) => (
                        <option
                          key={level}
                          value={level}
                        >
                          {level}
                        </option>
                      )
                    )}

                  </select>

                  <ChevronDown
                    size={14}
                  />

                </div>

              </div>
            );
          })}

        </div>


        {features.length === 0 && (
          <div className="configuration-empty">
            No features were found in the
            baseline dataset.
          </div>
        )}

      </section>


      {/* ==================================================
          SAVE
      ================================================== */}

      <section className="configuration-submit">

        <div>
          <span>
            SAVE CHANGES
          </span>

          <p>
            These settings will be used
            during future drift analyses.
          </p>
        </div>


        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={14} />

          {saving
            ? "Saving..."
            : "Save configuration"}
        </button>

      </section>

    </div>
  );
}


export default ModelConfigurationPage;