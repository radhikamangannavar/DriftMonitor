def assess_model_health(model_evidence):
    affected_coverage = model_evidence[
        "affected_coverage"
    ]

    high_importance_coverage = model_evidence[
        "high_importance_coverage"
    ]

    high_severity_count = model_evidence[
        "high_severity_features"
    ]

    medium_severity_count = model_evidence[
        "medium_severity_features"
    ]

    overall_confidence = model_evidence[
        "overall_confidence"
    ]

    affected_features = model_evidence[
        "affected_features"
    ]

    # --------------------------------------------------
    # No affected features
    # --------------------------------------------------

    if affected_features == 0:
        status = "HEALTHY"

    # --------------------------------------------------
    # CRITICAL
    #
    # Multiple high-severity features AND meaningful
    # high-importance impact.
    #
    # Confidence must be at least MEDIUM.
    # --------------------------------------------------

    elif (
        high_severity_count >= 2
        and high_importance_coverage >= 0.5
        and overall_confidence in ["MEDIUM", "HIGH"]
    ):
        status = "CRITICAL"

    # --------------------------------------------------
    # HIGH
    #
    # Strong high-severity evidence with reasonable
    # confidence, OR broad high-confidence drift.
    # --------------------------------------------------

    elif (
        (
            high_severity_count >= 1
            and overall_confidence in ["MEDIUM", "HIGH"]
        )
        or (
            affected_coverage >= 0.75
            and overall_confidence == "HIGH"
        )
    ):
        status = "HIGH"

    # --------------------------------------------------
    # MEDIUM
    #
    # Meaningful drift exists, but there is not enough
    # evidence to classify the model as HIGH/CRITICAL.
    #
    # Require at least MEDIUM confidence for coverage-based
    # escalation.
    # --------------------------------------------------

    elif (
        overall_confidence in ["MEDIUM", "HIGH"]
        and (
            affected_coverage >= 0.25
            or medium_severity_count >= 1
        )
    ):
        status = "MEDIUM"

    # --------------------------------------------------
    # LOW
    #
    # Drift exists, but evidence is weak / low confidence.
    # --------------------------------------------------

    else:
        status = "LOW"

    return {
        "status": status,
        "contributing_features": model_evidence[
            "top_contributors"
        ],
        "evidence": model_evidence,
    }