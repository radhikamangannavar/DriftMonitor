def generate_recommendations(model_health):
    recommendations = []

    status = model_health["status"]

    contributing_features = model_health[
        "contributing_features"
    ]

    if status == "CRITICAL":
        recommendations.append(
            "Validate the affected data pipeline immediately."
        )

        recommendations.append(
            "Investigate high-severity features before relying on model predictions."
        )

        recommendations.append(
            "Consider model validation and retraining after confirming the drift."
        )

    elif status == "HIGH":
        recommendations.append(
            "Investigate features showing significant drift."
        )

        recommendations.append(
            "Validate the upstream data pipeline for affected features."
        )

    elif status == "MEDIUM":
        recommendations.append(
            "Monitor affected features closely and investigate persistent drift."
        )

    elif status == "LOW":
        recommendations.append(
            "Continue monitoring the affected features for further drift."
        )

    else:
        recommendations.append(
            "No immediate action required; continue routine monitoring."
        )

    # Feature-specific recommendations.
    for feature in contributing_features:
        feature_name = feature["feature"]

        if feature["severity"] == "HIGH":
            recommendations.append(
                f"Investigate feature '{feature_name}' as a high-severity drift contributor."
            )

        elif feature["severity"] == "MEDIUM":
            if feature["confidence"] == "LOW":
                recommendations.append(
                    f"Validate the drift signal for '{feature_name}' because confidence is low."
                )

    return recommendations