def build_decision_trace(
    feature_assessments,
    model_evidence,
    model_health,
    recommendations,
):
    return {
        "feature_decisions": [
            {
                "feature": feature["feature"],
                "status": feature["status"],
                "severity": feature["severity"],
                "importance": feature["importance"],
                "confidence": feature["confidence"],
                "contribution": feature["contribution"],
                "evidence": feature["evidence"],
                "decision_trace": feature[
                    "decision_trace"
                ],
            }
            for feature in feature_assessments
        ],

        "model_decision": {
            "status": model_health["status"],

            "total_features": model_evidence[
                "total_features"
            ],

            # Confirmed drift only.
            "affected_features": model_evidence[
                "affected_features"
            ],

            "affected_coverage": model_evidence[
                "affected_coverage"
            ],

            # Suspected drift is tracked separately.
            "suspected_features": model_evidence[
                "suspected_features"
            ],

            "high_severity_features": model_evidence[
                "high_severity_features"
            ],

            "medium_severity_features": model_evidence[
                "medium_severity_features"
            ],

            "low_severity_features": model_evidence[
                "low_severity_features"
            ],

            "high_importance_features": model_evidence[
                "high_importance_features"
            ],

            "affected_high_importance": model_evidence[
                "affected_high_importance"
            ],

            "high_importance_coverage": model_evidence[
                "high_importance_coverage"
            ],

            "average_confidence": model_evidence[
                "average_confidence"
            ],

            "overall_confidence": model_evidence[
                "overall_confidence"
            ],
        },

        "recommendations": recommendations,
    }