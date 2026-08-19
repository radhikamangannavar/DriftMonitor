from decision.recommendations import generate_recommendations


model_health = {
    "status": "HIGH",
    "contributing_features": [
        {
            "feature": "income",
            "severity": "HIGH",
            "importance": "HIGH",
            "confidence": "HIGH",
            "contribution": 1.0,
        }
    ],
    "evidence": {},
}

recommendations = generate_recommendations(
    model_health
)

print("Recommendations:")
for recommendation in recommendations:
    print("-", recommendation)