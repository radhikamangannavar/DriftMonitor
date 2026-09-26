from .decision_engine import (
    build_feature_assessment,
)

from .model_evidence import (
    build_model_evidence,
)

from .model_health import (
    assess_model_health,
)

from .recommendations import (
    generate_recommendations,
)

from .decision_trace import (
    build_decision_trace,
)

from .config import PSI_THRESHOLD


def run_decision_engine(
    feature_results,
    importance_map=None,
    psi_threshold=PSI_THRESHOLD,
):
    feature_assessments = [
        build_feature_assessment(
            feature_result,
            importance_map=importance_map,
            psi_threshold=psi_threshold,
        )
        for feature_result
        in feature_results
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
        "feature_assessments":
            feature_assessments,

        "model_evidence":
            model_evidence,

        "model_health":
            model_health,

        "recommendations":
            recommendations,

        "decision_trace":
            decision_trace,
    }