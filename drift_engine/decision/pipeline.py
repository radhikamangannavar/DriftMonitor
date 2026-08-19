from decision.decision_engine import build_feature_assessment
from decision.model_evidence import build_model_evidence
from decision.model_health import assess_model_health
from decision.recommendations import generate_recommendations
from decision.decision_trace import build_decision_trace


def run_decision_engine(
    feature_results,
    importance_map=None,
):
    feature_assessments = [
        build_feature_assessment(
            feature_result,
            importance_map=importance_map,
        )
        for feature_result in feature_results
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

    return {
        "feature_assessments": feature_assessments,
        "model_evidence": model_evidence,
        "model_health": model_health,
        "recommendations": recommendations,
        "decision_trace": decision_trace,
    }