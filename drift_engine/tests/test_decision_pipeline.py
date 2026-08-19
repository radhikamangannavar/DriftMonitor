from decision.decision_engine import build_feature_assessment
from decision.model_evidence import build_model_evidence
from decision.model_health import assess_model_health
from decision.recommendations import generate_recommendations
from decision.decision_trace import build_decision_trace


feature_results = [
    {
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
    },
    {
        "feature": "city",
        "feature_type": "categorical",
        "tests": {
            "chi_square": {
                "statistic": 5.33,
                "p_value": 0.149,
                "alpha": 0.05,
                "significant": False,
            },
        },
        "evidence": {
            "categorical": {
                "new_categories": ["Delhi"],
                "disappeared_categories": ["Belgaum", "Mysore"],
            }
        },
    },
]


feature_assessments = [
    build_feature_assessment(
        feature,
        importance_map={
            "income": "HIGH",
            "city": "MEDIUM",
        },
    )
    for feature in feature_results
]

model_evidence = build_model_evidence(
    feature_assessments
)

model_health = assess_model_health(
    model_evidence
)

recommendations = generate_recommendations(
    model_health
)

decision_trace = build_decision_trace(
    feature_assessments,
    model_evidence,
    model_health,
    recommendations,
)

print("Feature Assessments:")
print(feature_assessments)

print("\nModel Evidence:")
print(model_evidence)

print("\nModel Health:")
print(model_health)

print("\nRecommendations:")
print(recommendations)

print("\nDecision Trace:")
print(decision_trace)