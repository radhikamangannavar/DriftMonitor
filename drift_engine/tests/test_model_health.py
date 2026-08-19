from decision.model_health import assess_model_health


model_evidence = {
    "affected_coverage": 0.5,
    "high_importance_coverage": 1.0,
    "overall_confidence": "HIGH",
    "top_contributors": [
        {
            "feature": "income",
            "severity": "HIGH",
            "importance": "HIGH",
            "confidence": "HIGH",
            "contribution": 1.0,
        }
    ],
}

result = assess_model_health(model_evidence)

print("Model Health:")
print(result)