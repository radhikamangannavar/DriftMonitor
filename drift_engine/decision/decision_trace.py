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
                "decision_trace": feature["decision_trace"],
            }
            for feature in feature_assessments
        ],
        "model_decision": {
            "status": model_health["status"],
            "affected_coverage": model_evidence["affected_coverage"],
            "high_importance_coverage": model_evidence[
                "high_importance_coverage"
            ],
            "overall_confidence": model_evidence[
                "overall_confidence"
            ],
        },
        "recommendations": recommendations,
    }