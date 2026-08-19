def build_model_evidence(feature_assessments):
    total_features = len(feature_assessments)

    affected_features = [
        feature
        for feature in feature_assessments
        if feature["status"] == "DRIFT_DETECTED"
    ]

    high_importance_features = [
        feature
        for feature in feature_assessments
        if feature["importance"] == "HIGH"
    ]

    affected_high_importance = [
        feature
        for feature in affected_features
        if feature["importance"] == "HIGH"
    ]

    affected_coverage = (
        len(affected_features) / total_features
        if total_features > 0
        else 0.0
    )

    high_importance_coverage = (
        len(affected_high_importance) / len(high_importance_features)
        if high_importance_features
        else 0.0
    )

    top_contributors = sorted(
        affected_features,
        key=lambda feature: feature["contribution"],
        reverse=True,
    )

    confidence_scores = {
        "LOW": 1,
        "MEDIUM": 2,
        "HIGH": 3,
    }

    if total_features > 0:
        average_confidence = sum(
            confidence_scores.get(
                feature["confidence"],
                1
            )
            for feature in feature_assessments
        ) / total_features

        if average_confidence >= 2.5:
            overall_confidence = "HIGH"
        elif average_confidence >= 1.5:
            overall_confidence = "MEDIUM"
        else:
            overall_confidence = "LOW"
    else:
        overall_confidence = "LOW"

    return {
        "affected_coverage": affected_coverage,
        "high_importance_coverage": high_importance_coverage,
        "top_contributors": top_contributors,
        "overall_confidence": overall_confidence,
    }