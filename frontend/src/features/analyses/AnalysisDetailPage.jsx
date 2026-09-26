import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Database,
  Gauge,
  ShieldCheck,
  Target,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../services/api";
import "./analyses.css";

function AnalysisDetailPage() {
  const { analysisId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedFeature, setExpandedFeature] = useState(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await api.get(`/analyses/${analysisId}`);
        setAnalysis(result.data);
      } catch (err) {
        setError(err.message || "Unable to load analysis.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="analysis-detail-state">
        <Activity size={18} className="analyses-spinning" />
        <strong>Loading analysis...</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-detail-state">
        <TriangleAlert size={18} />

        <strong>Unable to load analysis</strong>

        <p>{error}</p>

        <Link
          to="/app/analyses"
          className="analysis-detail-back-button"
        >
          <ArrowLeft size={14} />
          Back to analyses
        </Link>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const report = analysis.report || {};
  const summary = report.summary || {};

  const features = Array.isArray(report.feature_assessments)
    ? report.feature_assessments
    : [];

  const modelDecision =
    report.decision_trace?.model_decision || {};

  const health =
    analysis.health ||
    summary.model_health ||
    "—";

  const confidence =
    analysis.overallConfidence ||
    summary.overall_confidence ||
    "—";

  const coverage =
    typeof analysis.affectedCoverage === "number"
      ? `${(analysis.affectedCoverage * 100).toFixed(1)}%`
      : "—";

  const createdDate = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : "—";

  const affectedFeatures = features.filter(
    (feature) => feature.status === "DRIFT_DETECTED"
  );

  const suspectedFeatures = features.filter(
    (feature) => feature.status === "DRIFT_SUSPECTED"
  );

  const highSeverity = affectedFeatures.filter(
    (feature) => feature.severity === "HIGH"
  ).length;

  const mediumSeverity = affectedFeatures.filter(
    (feature) => feature.severity === "MEDIUM"
  ).length;

  const lowSeverity = affectedFeatures.filter(
    (feature) => feature.severity === "LOW"
  ).length;

  const recommendation =
    analysis.recommendation ||
    report.recommendations?.[0] ||
    "No recommendation available";

  return (
    <div className="analysis-detail-page">
      {/* BACK */}
      <Link
        to="/app/analyses"
        className="analysis-detail-back"
      >
        <ArrowLeft size={14} />
        Back to analyses
      </Link>

      {/* HEADER */}
      <section className="analysis-detail-intro">
        <div>
          <div className="analyses-kicker">
            ANALYSIS
          </div>

          <h1>
            {analysis.modelId?.name || "Model analysis"}
          </h1>

          <p>
            Statistical comparison between the selected
            baseline and current datasets.
          </p>
        </div>

        <div
          className={`analysis-detail-health ${String(
            health
          ).toLowerCase()}`}
        >
          <span>MODEL HEALTH</span>
          <strong>{health}</strong>
        </div>
      </section>

      {/* META */}
      <section className="analysis-detail-meta">
        <MetaItem
          label="STATUS"
          icon={
            analysis.status === "completed" ? (
              <CheckCircle2 size={14} />
            ) : analysis.status === "failed" ? (
              <XCircle size={14} />
            ) : (
              <Activity size={14} />
            )
          }
          value={formatLabel(analysis.status)}
        />

        <MetaItem
          label="RUN DATE"
          value={createdDate}
        />

        <MetaItem
          label="CONFIDENCE"
          icon={<ShieldCheck size={14} />}
          value={confidence}
        />

        <MetaItem
          label="AFFECTED COVERAGE"
          value={coverage}
        />
      </section>

      {/* EVIDENCE SUMMARY */}
      <section className="analysis-detail-section">
        <SectionHeading
          kicker="EVIDENCE"
          title="What changed"
        />

        <div className="analysis-result-grid">
          <ResultCard
            icon={<Target size={16} />}
            label="AFFECTED FEATURES"
            value={affectedFeatures.length}
            description="Confirmed statistical drift"
          />

          <ResultCard
            icon={<AlertTriangle size={16} />}
            label="SUSPECTED"
            value={suspectedFeatures.length}
            description="Evidence requiring caution"
          />

          <ResultCard
            icon={<BarChart3 size={16} />}
            label="TOTAL FEATURES"
            value={
              summary.total_features ?? features.length
            }
            description="Features evaluated"
          />
        </div>
      </section>

      {/* SEVERITY */}
      <section className="analysis-detail-section">
        <SectionHeading
          kicker="SEVERITY"
          title="Drift distribution"
        />

        <div className="analysis-severity-grid">
          <SeverityCard
            label="HIGH"
            value={highSeverity}
          />

          <SeverityCard
            label="MEDIUM"
            value={mediumSeverity}
          />

          <SeverityCard
            label="LOW"
            value={lowSeverity}
          />
        </div>
      </section>

      {/* DATASETS */}
      <section className="analysis-detail-section">
        <SectionHeading
          kicker="DATA"
          title="Compared datasets"
        />

        <div className="analysis-dataset-grid">
          <DatasetCard
            label="BASELINE"
            dataset={analysis.baselineDatasetId}
          />

          <DatasetCard
            label="CURRENT"
            dataset={analysis.currentDatasetId}
          />
        </div>
      </section>

      {/* MODEL DECISION */}
      <ModelDecision decision={modelDecision} />

      {/* FEATURE EVIDENCE */}
      <section className="analysis-detail-section">
        <div className="analysis-detail-section-heading">
          <div>
            <div className="analyses-kicker">
              FEATURE EVIDENCE
            </div>

            <h2>Statistical breakdown</h2>
          </div>

          <span className="analysis-feature-count">
            {features.length}{" "}
            {features.length === 1 ? "feature" : "features"}
          </span>
        </div>

        {features.length === 0 ? (
          <div className="analysis-no-evidence">
            No feature-level evidence was returned.
          </div>
        ) : (
          <div className="analysis-feature-list">
            {features.map((feature, index) => {
              const isExpanded =
                expandedFeature === index;

              /*
               * Current report structure:
               *
               * feature
               * └── evidence
               *      ├── tests
               *      └── additional_evidence
               */
              const evidence = feature.evidence || {};

              const tests =
                evidence.tests || feature.tests || {};

              const additionalEvidence =
                evidence.additional_evidence || {};

              return (
                <div
                  key={`${feature.feature}-${index}`}
                  className="analysis-feature"
                >
                  {/* FEATURE HEADER */}
                  <button
                    type="button"
                    className="analysis-feature-header"
                    onClick={() =>
                      setExpandedFeature(
                        isExpanded ? null : index
                      )
                    }
                    aria-expanded={isExpanded}
                  >
                    <div className="analysis-feature-main">
                      <div className="analysis-feature-icon">
                        <Gauge size={15} />
                      </div>

                      <div>
                        <strong>
                          {feature.feature}
                        </strong>

                        <span>
                          {feature.feature_type ||
                            "feature"}
                        </span>
                      </div>
                    </div>

                    <div className="analysis-feature-status">
                      <span className="analysis-feature-badge">
                        {formatStatus(feature.status)}
                      </span>

                      {feature.severity && (
                        <span className="analysis-feature-severity">
                          {feature.severity}
                        </span>
                      )}
                      {feature.importance && (
                        <span className="analysis-feature-importance">
                          {feature.importance}
                            </span>
                        )}
                      <ChevronDown
                        size={15}
                        className={
                          isExpanded
                            ? "analysis-feature-chevron open"
                            : "analysis-feature-chevron"
                        }
                      />
                    </div>
                  </button>

                  {/* FEATURE DETAILS */}
                  {isExpanded && (
                    <div className="analysis-feature-details">
                      <div className="analysis-feature-metrics">
                        <Metric
                          label="IMPORTANCE"
                          value={
                            feature.importance || "—"
                          }
                        />

                        <Metric
                          label="CONFIDENCE"
                          value={
                            feature.confidence || "—"
                          }
                        />

                        <Metric
                          label="CONTRIBUTION"
                          value={formatNumber(
                            feature.contribution
                          )}
                        />
                      </div>

                      {/* STATISTICAL TESTS */}
                      {Object.keys(tests).length > 0 && (
                        <div className="analysis-tests">
                          <div className="analysis-tests-title">
                            STATISTICAL TESTS
                          </div>

                          <div className="analysis-test-grid">
                            {tests.psi !== undefined && (
                              <TestCard
                                label="PSI"
                                description="Population Stability Index"
                                data={tests.psi}
                              />
                            )}

                            {tests.ks && (
                              <TestCard
                                label="KS"
                                description="Kolmogorov–Smirnov test"
                                data={tests.ks}
                              />
                            )}

                            {tests.chi_square && (
                              <TestCard
                                label="CHI-SQUARE"
                                description="Categorical distribution test"
                                data={tests.chi_square}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* ADDITIONAL EVIDENCE */}
                      {Object.keys(additionalEvidence)
                        .length > 0 && (
                        <div className="analysis-feature-evidence">
                          <div className="analysis-tests-title">
                            ADDITIONAL EVIDENCE
                          </div>

                          <EvidenceList
                            data={additionalEvidence}
                          />
                        </div>
                      )}

                      {/* DECISION TRACE */}
                      {Array.isArray(
                        feature.decision_trace
                      ) &&
                        feature.decision_trace.length > 0 && (
                          <div className="analysis-decision-trace">
                            <div className="analysis-tests-title">
                              DECISION TRACE
                            </div>

                            <div className="analysis-trace-items">
                              {feature.decision_trace.map(
                                (item, traceIndex) => (
                                  <span
                                    key={`${item}-${traceIndex}`}
                                  >
                                    {formatLabel(item)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                      {/* FEATURE RECOMMENDATION */}
                      {feature.recommendation && (
                        <div className="analysis-feature-recommendation">
                          <span>RECOMMENDATION</span>
                          <strong>
                            {formatValue(
                              feature.recommendation
                            )}
                          </strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FINAL RECOMMENDATION */}
      <section className="analysis-recommendation">
        <div className="analysis-recommendation-icon">
          <Gauge size={19} />
        </div>

        <div>
          <div className="analyses-kicker">
            RECOMMENDATION
          </div>

          <h2>{recommendation}</h2>

          <p>
            Based on the statistical evidence produced
            by the drift engine.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ======================================================
   META ITEM
====================================================== */

function MetaItem({
  label,
  value,
  icon,
}) {
  return (
    <div>
      <span>{label}</span>

      <strong>
        {icon}
        {value}
      </strong>
    </div>
  );
}

/* ======================================================
   SECTION HEADING
====================================================== */

function SectionHeading({
  kicker,
  title,
}) {
  return (
    <div className="analysis-detail-section-heading">
      <div>
        <div className="analyses-kicker">
          {kicker}
        </div>

        <h2>{title}</h2>
      </div>
    </div>
  );
}

/* ======================================================
   RESULT CARD
====================================================== */

function ResultCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="analysis-result-card">
      <div className="analysis-result-icon">
        {icon}
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

      <small>{description}</small>
    </div>
  );
}

/* ======================================================
   SEVERITY CARD
====================================================== */

function SeverityCard({
  label,
  value,
}) {
  return (
    <div className="analysis-severity-card">
      <span>{label}</span>

      <strong>{value}</strong>

      <small>confirmed features</small>
    </div>
  );
}

/* ======================================================
   DATASET CARD
====================================================== */

function DatasetCard({
  label,
  dataset,
}) {
  return (
    <div className="analysis-dataset-card">
      <div className="analysis-dataset-icon">
        <Database size={17} />
      </div>

      <div>
        <span>{label}</span>

        <strong>
          {dataset?.name || "—"}
        </strong>

        <small>
          {dataset?.fileName || "—"}
        </small>
      </div>
    </div>
  );
}

/* ======================================================
   MODEL DECISION
====================================================== */

function ModelDecision({
  decision,
}) {
  if (
    !decision ||
    Object.keys(decision).length === 0
  ) {
    return null;
  }

  const coverage =
    typeof decision.affected_coverage === "number"
      ? `${(
          decision.affected_coverage * 100
        ).toFixed(1)}%`
      : "—";

  return (
    <section className="analysis-detail-section">
      <SectionHeading
        kicker="MODEL DECISION"
        title="Evidence-based assessment"
      />

      <div className="analysis-decision-grid">
        <div className="analysis-decision-main">
          <span>MODEL HEALTH</span>

          <strong>
            {formatStatus(decision.status)}
          </strong>

          <p>
            Model health is determined from the
            statistical evidence collected across the
            evaluated features.
          </p>
        </div>

        <DecisionStat
          label="AFFECTED COVERAGE"
          value={coverage}
        />

        <DecisionStat
          label="CONFIDENCE"
          value={
            decision.overall_confidence || "—"
          }
        />

        <DecisionStat
          label="AFFECTED FEATURES"
          value={
            decision.affected_features ?? 0
          }
        />

        <DecisionStat
          label="SUSPECTED FEATURES"
          value={
            decision.suspected_features ?? 0
          }
        />
      </div>

      <div className="analysis-decision-severity">
  <DecisionStat
    label="HIGH SEVERITY"
    value={
      decision.high_severity_features ?? 0
    }
  />

  <DecisionStat
    label="MEDIUM SEVERITY"
    value={
      decision.medium_severity_features ?? 0
    }
  />

  <DecisionStat
    label="LOW SEVERITY"
    value={
      decision.low_severity_features ?? 0
    }
  />

  <DecisionStat
    label="TOTAL FEATURES"
    value={
      decision.total_features ?? 0
    }
  />

  <DecisionStat
    label="HIGH IMPORTANCE"
    value={
      decision.high_importance_features ?? 0
    }
  />

  <DecisionStat
    label="AFFECTED HIGH IMPORTANCE"
    value={
      decision.affected_high_importance ?? 0
    }
  />

  <DecisionStat
    label="HIGH IMPORTANCE COVERAGE"
    value={
      typeof decision.high_importance_coverage === "number"
        ? `${(
            decision.high_importance_coverage * 100
          ).toFixed(1)}%`
        : "—"
    }
  />
</div>
    </section>
  );
}

/* ======================================================
   DECISION STAT
====================================================== */

function DecisionStat({
  label,
  value,
}) {
  return (
    <div className="analysis-decision-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* ======================================================
   METRIC
====================================================== */

function Metric({
  label,
  value,
}) {
  return (
    <div className="analysis-feature-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* ======================================================
   TEST CARD
====================================================== */

function TestCard({
  label,
  description,
  data,
}) {
  if (
    data === null ||
    data === undefined
  ) {
    return null;
  }

  const entries =
    typeof data === "object" &&
    !Array.isArray(data)
      ? Object.entries(data)
      : [["value", data]];

  return (
    <div className="analysis-test-card">
      <span>{label}</span>
      <small className="analysis-test-description">
  {description}
</small>

      {entries.map(([key, value]) => {
        if (
          value !== null &&
          typeof value === "object"
        ) {
          return (
            <div
              key={key}
              className="analysis-test-nested"
            >
              <small>
                {formatLabel(key)}
              </small>

              <div className="analysis-test-nested-values">
                {renderNestedValues(value)}
              </div>
            </div>
          );
        }

        return (
          <div
            key={key}
            className="analysis-test-row"
          >
            <small>
              {formatLabel(key)}
            </small>

            <strong>
              {formatTestValue(value, key)}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

/* ======================================================
   NESTED VALUES
====================================================== */

function renderNestedValues(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return (
      <div className="analysis-test-row">
        <small>Value</small>
        <strong>—</strong>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <div
        key={index}
        className="analysis-test-row"
      >
        <small>{index + 1}</small>

        <strong>
          {formatTestValue(item)}
        </strong>
      </div>
    ));
  }

  if (typeof value === "object") {
    return Object.entries(value).map(
      ([key, nestedValue]) => (
        <div
          key={key}
          className="analysis-test-row"
        >
          <small>
            {formatLabel(key)}
          </small>

          <strong>
            {formatTestValue(
              nestedValue,
              key
            )}
          </strong>
        </div>
      )
    );
  }

  return (
    <div className="analysis-test-row">
      <small>Value</small>

      <strong>
        {formatTestValue(value)}
      </strong>
    </div>
  );
}

/* ======================================================
   ADDITIONAL EVIDENCE
====================================================== */

function EvidenceList({
  data,
}) {
  return (
    <div className="analysis-evidence-list">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="analysis-evidence-item"
        >
          <span>{formatLabel(key)}</span>

          <div className="analysis-evidence-value">
            {renderEvidenceValue(value, key)}
          </div>
        </div>
      ))}
    </div>
  );
}

function renderEvidenceValue(value, key = "") {
  if (value === null || value === undefined) {
    return <strong>—</strong>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <strong>None</strong>;
    }

    return (
      <div className="analysis-evidence-inline-list">
        {value.map((item, index) => (
          <span key={`${key}-${index}`}>
            {formatTestValue(item)}
          </span>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <strong>—</strong>;
    }

    return (
      <div className="analysis-evidence-nested">
        {entries.map(([nestedKey, nestedValue]) => (
          <div
            key={nestedKey}
            className="analysis-evidence-nested-row"
          >
            <span>{formatLabel(nestedKey)}</span>
            <div className="analysis-evidence-nested-value">
              {renderEvidenceValue(nestedValue, nestedKey)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <strong>
      {formatTestValue(value, key)}
    </strong>
  );
}

/* ======================================================
   FORMAT HELPERS
====================================================== */

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatLabel(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatNumber(value) {
  if (
    typeof value !== "number" ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return value.toFixed(3);
}

function formatTestValue(
  value,
  key = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    const normalizedKey =
      String(key).toLowerCase();

    if (
      normalizedKey.includes("p_value") ||
      normalizedKey.includes("pvalue")
    ) {
      if (value < 0.0001) {
        return "< 0.0001";
      }

      return value.toFixed(4);
    }

    if (
      Math.abs(value) > 0 &&
      Math.abs(value) < 0.0001
    ) {
      return value.toExponential(3);
    }

    if (Number.isInteger(value)) {
      return String(value);
    }

    return value.toFixed(4);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([nestedKey, nestedValue]) =>
          `${formatLabel(nestedKey)}: ${formatValue(
            nestedValue
          )}`
      )
      .join(", ");
  }

  return String(value);
}

function formatValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([key, nestedValue]) =>
          `${formatLabel(key)}: ${formatValue(
            nestedValue
          )}`
      )
      .join(", ");
  }

  return String(value);
}

export default AnalysisDetailPage;