from decision.decision_engine import build_feature_assessment


feature_result = {
    "feature": "income",
    "feature_type": "numerical",
    "tests": {
        "psi": 46.05,
        "ks": {
            "statistic": 1.0,
            "p_value": 0.02857,
            "alpha": 0.05,
            "significant": True,
        },
    },
    "evidence": {},
}

assessment = build_feature_assessment(
    feature_result,
    importance_map={
        "income": "HIGH",
    },
)

print("Feature Assessment:")
print(assessment)