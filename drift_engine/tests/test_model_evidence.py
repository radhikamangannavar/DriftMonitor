from decision.model_evidence import build_model_evidence


feature_assessments = [
    {
        "feature": "income",
        "feature_type": "numerical",
        "status": "DRIFT_DETECTED",
        "severity": "HIGH",
        "importance": "HIGH",
        "confidence": "HIGH",
        "contribution": 1.0,
        "evidence": {},
        "decision_trace": ["psi", "ks"],
        "recommendation": None,
    },
    {
        "feature": "age",
        "feature_type": "numerical",
        "status": "NO_DRIFT",
        "severity": "NONE",
        "importance": "MEDIUM",
        "confidence": "HIGH",
        "contribution": 0.3,
        "evidence": {},
        "decision_trace": [],
        "recommendation": None,
    },
]

result = build_model_evidence(feature_assessments)

print("Model Evidence:")
print(result)