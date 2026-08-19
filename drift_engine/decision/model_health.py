def assess_model_health(model_evidence):
    affected_coverage = model_evidence["affected_coverage"]
    high_importance_coverage = model_evidence["high_importance_coverage"]
    overall_confidence = model_evidence["overall_confidence"]

    top_contributors = model_evidence["top_contributors"]

    high_severity_features = [
        feature
        for feature in top_contributors
        if feature["severity"] == "HIGH"
    ]

    high_importance_features = [
        feature
        for feature in top_contributors
        if feature["importance"] == "HIGH"
    ]

    high_confidence_features = [
        feature
        for feature in top_contributors
        if feature["confidence"] == "HIGH"
    ]

    if (
        len(high_importance_features) >= 2
        and len(high_severity_features) >= 2
        and len(high_confidence_features) >= 2
        and high_importance_coverage >= 0.5
    ):
        status = "CRITICAL"

    elif (
        (
            len(high_importance_features) >= 1
            and len(high_severity_features) >= 1
            and len(high_confidence_features) >= 1
        )
        or affected_coverage >= 0.5
    ):
        status = "HIGH"

    elif (
        affected_coverage > 0
        and (
            high_importance_coverage > 0
            or overall_confidence in ["MEDIUM", "HIGH"]
        )
    ):
        status = "MEDIUM"

    elif affected_coverage > 0:
        status = "LOW"

    else:
        status = "HEALTHY"

    return {
        "status": status,
        "contributing_features": top_contributors,
        "evidence": model_evidence,
    }