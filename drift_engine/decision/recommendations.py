def generate_recommendations(model_health):
    recommendations = []

    status = model_health["status"]
    contributing_features = model_health["contributing_features"]

    if status in ["HIGH", "CRITICAL"]:
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

    for feature in contributing_features:
        if feature["severity"] == "HIGH":
            recommendations.append(
                f"Investigate feature '{feature['feature']}' as a high-severity drift contributor."
            )

        if feature["confidence"] == "LOW":
            recommendations.append(
                f"Validate the drift signal for '{feature['feature']}' because confidence is low."
            )

    if status == "CRITICAL":
        recommendations.append(
            "Consider model validation and retraining after confirming the drift."
        )

    return recommendations