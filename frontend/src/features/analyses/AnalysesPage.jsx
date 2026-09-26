import { useEffect, useState } from "react";

import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Plus,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { api } from "../../services/api";

import "./analyses.css";


function AnalysesPage() {
  const [analyses, setAnalyses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // --------------------------------------------------
  // Load analyses
  // --------------------------------------------------

  const loadAnalyses = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await api.get("/analyses");

      setAnalyses(result.data || []);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load analyses."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAnalyses();
  }, []);


  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const completedCount =
    analyses.filter(
      (analysis) =>
        analysis.status === "completed"
    ).length;

  const pendingCount =
    analyses.filter(
      (analysis) =>
        analysis.status === "pending"
    ).length;

  const failedCount =
    analyses.filter(
      (analysis) =>
        analysis.status === "failed"
    ).length;


  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="analyses-page">

      {/* =================================================
          INTRO
      ================================================= */}

      <section className="analyses-intro">

        <div>

          <div className="analyses-kicker">
            ANALYSES
          </div>

          <h1>
            Statistical
            <br />
            evidence.
          </h1>

          <p>
            Understand how production data
            is moving away from its baseline
            through measurable statistical
            evidence.
          </p>

        </div>


        {/* -----------------------------------------------
            ACTIONS
        ----------------------------------------------- */}

        <div className="analyses-actions">

          <Link
            to="/app/analyses/new"
            className="analyses-new-button"
          >
            <Plus size={14} />
            New analysis
          </Link>


          <button
            type="button"
            className="analyses-refresh-button"
            onClick={loadAnalyses}
            disabled={loading}
          >

            <RefreshCw
              size={14}
              className={
                loading
                  ? "analyses-spinning"
                  : ""
              }
            />

            Refresh

          </button>

        </div>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="analyses-error">

          <TriangleAlert size={15} />

          {error}

        </div>
      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="analyses-summary">

        <div className="analysis-summary-item">

          <span>
            TOTAL
          </span>

          <strong>
            {loading
              ? "—"
              : analyses.length}
          </strong>

        </div>


        <div className="analysis-summary-item">

          <span>
            COMPLETED
          </span>

          <strong>
            {loading
              ? "—"
              : completedCount}
          </strong>

        </div>


        <div className="analysis-summary-item">

          <span>
            RUNNING
          </span>

          <strong>
            {loading
              ? "—"
              : pendingCount}
          </strong>

        </div>


        <div className="analysis-summary-item">

          <span>
            FAILED
          </span>

          <strong>
            {loading
              ? "—"
              : failedCount}
          </strong>

        </div>

      </section>


      {/* =================================================
          ANALYSIS LIST
      ================================================= */}

      <section className="analyses-list">

        <div className="analyses-list-header">

          <span>
            MODEL
          </span>

          <span>
            HEALTH
          </span>

          <span>
            COVERAGE
          </span>

          <span>
            CONFIDENCE
          </span>

          <span>
            STATUS
          </span>

          <span />

        </div>


        {/* -----------------------------------------------
            LOADING
        ----------------------------------------------- */}

        {loading ? (

          <div className="analyses-state">
            Loading analyses...
          </div>


        ) : analyses.length === 0 ? (

          /* ---------------------------------------------
             EMPTY
          --------------------------------------------- */

          <div className="analyses-empty">

            <div className="analyses-empty-icon">
              <Activity size={20} />
            </div>

            <h2>
              No analyses yet
            </h2>

            <p>
              Run an analysis between a
              baseline and current dataset
              to see statistical evidence
              here.
            </p>

            <Link
              to="/app/analyses/new"
              className="analyses-empty-action"
            >
              <Plus size={14} />
              Run your first analysis
            </Link>

          </div>


        ) : (

          /* ---------------------------------------------
             RESULTS
          --------------------------------------------- */

          <div className="analyses-rows">

            {analyses.map(
              (analysis) => {

                const health =
                  analysis.health || "—";


                const coverage =
                  typeof analysis.affectedCoverage ===
                  "number"
                    ? `${(
                        analysis.affectedCoverage *
                        100
                      ).toFixed(1)}%`
                    : "—";


                return (

                  <Link
                    key={analysis._id}
                    to={`/app/analyses/${analysis._id}`}
                    className="analysis-row"
                  >

                    {/* MODEL */}

                    <div className="analysis-model">

                      <div className="analysis-model-icon">
                        <Activity size={16} />
                      </div>

                      <div>

                        <strong>
                          {analysis.modelId?.name ||
                            "Unknown model"}
                        </strong>

                        <span>
                          {analysis.createdAt
                            ? new Date(
                                analysis.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </span>

                      </div>

                    </div>


                    {/* HEALTH */}

                    <div>

                      <span
                        className={`analysis-health ${health.toLowerCase()}`}
                      >
                        {health}
                      </span>

                    </div>


                    {/* COVERAGE */}

                    <div className="analysis-coverage">
                      {coverage}
                    </div>


                    {/* CONFIDENCE */}

                    <div className="analysis-confidence">

                      {analysis.overallConfidence ===
                      "HIGH" ? (

                        <CheckCircle2 size={14} />

                      ) : (

                        <Activity size={14} />

                      )}

                      {analysis.overallConfidence ||
                        "—"}

                    </div>


                    {/* STATUS */}

                    <div className="analysis-status">

                      {analysis.status ===
                      "completed" ? (

                        <>
                          <CheckCircle2
                            size={13}
                          />

                          Completed
                        </>

                      ) : analysis.status ===
                        "failed" ? (

                        <>
                          <XCircle
                            size={13}
                          />

                          Failed
                        </>

                      ) : (

                        <>
                          <Clock3
                            size={13}
                          />

                          Pending
                        </>

                      )}

                    </div>


                    {/* ARROW */}

                    <ChevronRight
                      size={15}
                      className="analysis-row-arrow"
                    />

                  </Link>

                );

              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default AnalysesPage;