import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowLeft,
  Database,
  Gauge,
  Play,
  TriangleAlert,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { api } from "../../services/api";

import "./analyses.css";

function NewAnalysisPage() {
  const navigate = useNavigate();

  const [models, setModels] = useState([]);
  const [datasets, setDatasets] = useState([]);

  const [modelId, setModelId] = useState("");
  const [baselineDatasetId, setBaselineDatasetId] =
    useState("");
  const [currentDatasetId, setCurrentDatasetId] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(
    sessionStorage.getItem(
      "driftmonitor_user"
    ) || "null"
  );

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        if (!user?.organizationId) {
          throw new Error(
            "Organization information is missing."
          );
        }

        const [modelsResult, datasetsResult] =
          await Promise.all([
            api.get(
              `/models/organization/${user.organizationId}`
            ),
            api.get("/datasets"),
          ]);

        setModels(modelsResult.data || []);
        setDatasets(datasetsResult.data || []);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load models and datasets."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.organizationId]);

  const modelDatasets = useMemo(() => {
    return datasets.filter((dataset) => {
      const datasetModelId =
        dataset.modelId?._id ||
        dataset.modelId;

      return datasetModelId === modelId;
    });
  }, [datasets, modelId]);

  const baselineDatasets =
    modelDatasets.filter(
      (dataset) =>
        dataset.type === "baseline"
    );

  const currentDatasets =
    modelDatasets.filter(
      (dataset) =>
        dataset.type === "current"
    );

  const selectedModel = models.find(
    (model) => model._id === modelId
  );

  const canRun =
    Boolean(
      modelId &&
      baselineDatasetId &&
      currentDatasetId
    ) && !running;

  function handleModelChange(event) {
    setModelId(event.target.value);

    setBaselineDatasetId("");
    setCurrentDatasetId("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canRun) {
      return;
    }

    try {
      setRunning(true);
      setError("");

      const result = await api.post(
        "/analyses",
        {
          modelId,
          baselineDatasetId,
          currentDatasetId,
        }
      );

      const analysisId =
        result.data?.analysisId;

      if (!analysisId) {
        throw new Error(
          "Analysis completed but no analysis ID was returned."
        );
      }

      navigate(
        `/app/analyses/${analysisId}`
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to run analysis."
      );

      setRunning(false);
    }
  }

  return (
    <div className="new-analysis-page">

      <Link
        to="/app/analyses"
        className="analysis-detail-back"
      >
        <ArrowLeft size={14} />
        Back to analyses
      </Link>

      <section className="new-analysis-intro">

        <div>

          <div className="analyses-kicker">
            NEW ANALYSIS
          </div>

          <h1>
            Compare.
            <br />
            Understand.
          </h1>

          <p>
            Compare a baseline dataset against
            current production data and let the
            statistical engine determine what changed.
          </p>

        </div>

        <div className="new-analysis-live">
          <Activity size={14} />
          Statistical engine ready
        </div>

      </section>

      {error && (
        <div className="analyses-error">
          <TriangleAlert size={15} />
          {error}
        </div>
      )}

      {loading ? (

        <div className="analyses-state">
          Loading workspace data...
        </div>

      ) : (

        <form
          className="new-analysis-form"
          onSubmit={handleSubmit}
        >

          {/* MODEL */}

          <section className="new-analysis-step">

            <div className="new-analysis-step-number">
              01
            </div>

            <div className="new-analysis-step-content">

              <div className="analyses-kicker">
                MODEL
              </div>

              <h2>
                Choose a model.
              </h2>

              <p>
                The selected model provides the
                monitoring configuration used by
                the statistical engine.
              </p>

              <div className="new-analysis-select-wrap">

                <Gauge size={17} />

                <select
                  value={modelId}
                  onChange={handleModelChange}
                >
                  <option value="">
                    Select a model
                  </option>

                  {models.map((model) => (
                    <option
                      key={model._id}
                      value={model._id}
                    >
                      {model.name}
                    </option>
                  ))}
                </select>

              </div>

              {selectedModel && (
                <div className="new-analysis-model-meta">

                  <span>
                    Risk profile
                  </span>

                  <strong>
                    {selectedModel.configuration
                      ?.riskProfile ||
                      "standard"}
                  </strong>

                </div>
              )}

            </div>

          </section>


          {/* DATASETS */}

          <section className="new-analysis-step">

            <div className="new-analysis-step-number">
              02
            </div>

            <div className="new-analysis-step-content">

              <div className="analyses-kicker">
                COMPARISON
              </div>

              <h2>
                Define the evidence.
              </h2>

              <p>
                Select the baseline representing
                expected behavior and the current
                dataset representing observed behavior.
              </p>

              <div className="new-analysis-dataset-grid">

                <div className="new-analysis-field">

                  <label>
                    BASELINE DATASET
                  </label>

                  <div className="new-analysis-select-wrap">

                    <Database size={16} />

                    <select
                      value={baselineDatasetId}
                      onChange={(event) =>
                        setBaselineDatasetId(
                          event.target.value
                        )
                      }
                      disabled={!modelId}
                    >

                      <option value="">
                        {modelId
                          ? "Select baseline dataset"
                          : "Select a model first"}
                      </option>

                      {baselineDatasets.map(
                        (dataset) => (
                          <option
                            key={dataset._id}
                            value={dataset._id}
                          >
                            {dataset.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>


                <div className="new-analysis-field">

                  <label>
                    CURRENT DATASET
                  </label>

                  <div className="new-analysis-select-wrap">

                    <Database size={16} />

                    <select
                      value={currentDatasetId}
                      onChange={(event) =>
                        setCurrentDatasetId(
                          event.target.value
                        )
                      }
                      disabled={!modelId}
                    >

                      <option value="">
                        {modelId
                          ? "Select current dataset"
                          : "Select a model first"}
                      </option>

                      {currentDatasets.map(
                        (dataset) => (
                          <option
                            key={dataset._id}
                            value={dataset._id}
                          >
                            {dataset.name}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                </div>

              </div>

            </div>

          </section>


          {/* RUN */}

          <section className="new-analysis-run">

            <div>

              <div className="analyses-kicker">
                READY
              </div>

              <h2>
                Run statistical analysis
              </h2>

              <p>
                The engine will inspect both datasets,
                calculate statistical evidence, evaluate
                model health, and produce a decision trace.
              </p>

            </div>

            <button
              type="submit"
              className="new-analysis-run-button"
              disabled={!canRun}
            >

              {running ? (
                <>
                  <Activity
                    size={15}
                    className="analyses-spinning"
                  />

                  Running analysis...
                </>
              ) : (
                <>
                  Run analysis
                  <Play size={14} />
                </>
              )}

            </button>

          </section>

        </form>

      )}

    </div>
  );
}

export default NewAnalysisPage;