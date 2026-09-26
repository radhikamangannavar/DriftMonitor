def calculate_overall_confidence(
    feature_assessments,
):
    """
    Determine model-level confidence from feature-level
    statistical confidence.

    DRIFT_SUSPECTED features are included because they are
    still evidence, but their LOW confidence prevents them
    from contributing to HIGH confidence.

    Rules:
        LOW  -> substantial weak evidence
        HIGH -> strong evidence dominates
        MEDIUM -> mixed/insufficient evidence
    """

    if not feature_assessments:
        return "LOW"

    confidences = [
        feature.get("confidence", "LOW")
        for feature in feature_assessments
    ]

    total = len(confidences)

    low_count = confidences.count("LOW")
    high_count = confidences.count("HIGH")

    low_ratio = low_count / total
    high_ratio = high_count / total

    # --------------------------------------------------
    # LOW
    #
    # At least half of the evidence is weak.
    # --------------------------------------------------

    if low_ratio >= 0.50:
        return "LOW"

    # --------------------------------------------------
    # HIGH
    #
    # At least 75% of the evidence is HIGH confidence
    # and weak evidence is limited.
    # --------------------------------------------------

    if (
        high_ratio >= 0.75
        and low_ratio <= 0.25
    ):
        return "HIGH"

    # --------------------------------------------------
    # MEDIUM
    # --------------------------------------------------

    return "MEDIUM"


def build_model_evidence(
    feature_assessments,
):
    """
    Aggregate feature-level decisions into model-level
    evidence.

    Only DRIFT_DETECTED features count toward confirmed
    affected coverage.

    DRIFT_SUSPECTED features remain available in the
    individual feature assessments but do not inflate
    confirmed model drift.
    """

    total_features = len(
        feature_assessments
    )

    # ==================================================
    # Confirmed drift
    # ==================================================

    affected_features = [
        feature
        for feature in feature_assessments
        if feature.get("status")
        == "DRIFT_DETECTED"
    ]

    # ==================================================
    # Suspected drift
    # ==================================================

    suspected_features = [
        feature
        for feature in feature_assessments
        if feature.get("status")
        == "DRIFT_SUSPECTED"
    ]

    # ==================================================
    # Severity counts
    # ==================================================

    high_severity_features = [
        feature
        for feature in affected_features
        if feature.get("severity")
        == "HIGH"
    ]

    medium_severity_features = [
        feature
        for feature in affected_features
        if feature.get("severity")
        == "MEDIUM"
    ]

    low_severity_features = [
        feature
        for feature in affected_features
        if feature.get("severity")
        == "LOW"
    ]

    # ==================================================
    # Feature importance
    # ==================================================

    high_importance_features = [
        feature
        for feature in feature_assessments
        if feature.get("importance")
        == "HIGH"
    ]

    affected_high_importance = [
        feature
        for feature in affected_features
        if feature.get("importance")
        == "HIGH"
    ]

    # ==================================================
    # Confirmed affected coverage
    # ==================================================

    affected_coverage = (
        len(affected_features)
        / total_features
        if total_features > 0
        else 0.0
    )

    # ==================================================
    # High-importance affected coverage
    # ==================================================

    high_importance_coverage = (
        len(affected_high_importance)
        / len(high_importance_features)
        if high_importance_features
        else 0.0
    )

    # ==================================================
    # Top contributors
    # ==================================================

    top_contributors = sorted(
        affected_features,
        key=lambda feature: feature.get(
            "contribution",
            0.0,
        ),
        reverse=True,
    )

    # ==================================================
    # Confidence
    # ==================================================

    confidence_scores = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
    }

    if total_features > 0:

        average_confidence = (
            sum(
                confidence_scores.get(
                    feature.get(
                        "confidence",
                        "LOW",
                    ),
                    1,
                )
                for feature in feature_assessments
            )
            / total_features
        )

    else:

        average_confidence = 1.0

    overall_confidence = (
        calculate_overall_confidence(
            feature_assessments
        )
    )

    # ==================================================
    # Final evidence
    # ==================================================

    return {
        "total_features": total_features,

        # Confirmed drift only.
        "affected_features": len(
            affected_features
        ),

        "affected_coverage": (
            affected_coverage
        ),

        # Descriptive/suspected drift.
        "suspected_features": len(
            suspected_features
        ),

        "high_severity_features": len(
            high_severity_features
        ),

        "medium_severity_features": len(
            medium_severity_features
        ),

        "low_severity_features": len(
            low_severity_features
        ),

        "high_importance_features": len(
            high_importance_features
        ),

        "affected_high_importance": len(
            affected_high_importance
        ),

        "high_importance_coverage": (
            high_importance_coverage
        ),

        "top_contributors": (
            top_contributors
        ),

        "average_confidence": (
            average_confidence
        ),

        "overall_confidence": (
            overall_confidence
        ),
    }