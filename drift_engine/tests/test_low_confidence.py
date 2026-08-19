from decision.decision_engine import build_feature_assessment


feature_result = {
    "feature": "income",
    "feature_type": "numerical",
    "tests": {
        "psi": 0.30,
        "ks": {
            "statistic": 0.20,
            "p_value": 0.80,
            "alpha": 0.05,
            "significant": False,
        },
    },
    "evidence": {},
}

result = build_feature_assessment(
    feature_result,
    importance_map={
        "income": "HIGH",
    },
)

print("Low Confidence Assessment:")
print(result)