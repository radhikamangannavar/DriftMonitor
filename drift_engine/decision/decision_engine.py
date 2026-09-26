from .config import (
    DEFAULT_FEATURE_IMPORTANCE,
    PSI_THRESHOLD,
)


# ============================================================
# Feature severity
# ============================================================

def assess_feature_severity(
    feature_result,
    psi_threshold=PSI_THRESHOLD,
):
    """
    Determine feature severity from statistically supported
    drift tests.

    Rules:
        0 significant reliable tests -> NONE
        1 significant reliable test  -> MEDIUM
        2+ significant reliable tests -> HIGH

    Statistical reliability is respected when a test provides
    explicit validity metadata.
    """

    tests = feature_result.get("tests", {})

    significant_tests = []

    for test_name, test_result in tests.items():

        # --------------------------------------------------
        # PSI
        # --------------------------------------------------

        if test_name == "psi":

            psi_result = evaluate_psi(
                test_result,
                threshold=psi_threshold,
            )

            if psi_result["significant"]:
                significant_tests.append("psi")

            continue

        # --------------------------------------------------
        # Statistical tests such as KS / Chi-square
        # --------------------------------------------------

        if not isinstance(test_result, dict):
            continue

        validity = test_result.get("validity")

        # If explicit reliability information exists,
        # an unreliable test must not determine severity.
        if validity is not None:
            if not validity.get(
                "statistically_reliable",
                False,
            ):
                continue

        if test_result.get("significant") is True:
            significant_tests.append(test_name)

    # --------------------------------------------------
    # Convert evidence strength into severity
    # --------------------------------------------------

    if len(significant_tests) == 0:
        severity = "NONE"

    elif len(significant_tests) == 1:
        severity = "MEDIUM"

    else:
        severity = "HIGH"

    return {
        "severity": severity,
        "significant_tests": significant_tests,
    }


# ============================================================
# Feature assessment
# ============================================================

def build_feature_assessment(
    feature_result,
    importance_map=None,
    psi_threshold=PSI_THRESHOLD,
):
    feature = feature_result["feature"]

    feature_type = feature_result[
        "feature_type"
    ]

    # --------------------------------------------------
    # Statistical assessment
    # --------------------------------------------------

    severity_result = assess_feature_severity(
        feature_result,
        psi_threshold=psi_threshold,
    )

    severity = severity_result["severity"]

    significant_tests = severity_result[
        "significant_tests"
    ]

    # --------------------------------------------------
    # Feature importance
    # --------------------------------------------------

    importance = get_feature_importance(
        feature,
        importance_map,
    )

    # --------------------------------------------------
    # Confidence
    # --------------------------------------------------

    confidence = calculate_confidence(
        feature_result,
        psi_threshold=psi_threshold,
    )

    # --------------------------------------------------
    # Categorical evidence
    # --------------------------------------------------

    categorical_evidence = {}

    if feature_type == "categorical":

        categorical_evidence = (
            evaluate_categorical_evidence(
                feature_result
            )
        )

    categorical_drift = False

    if feature_type == "categorical":

        categorical_drift = (
            categorical_evidence.get(
                "category_changes",
                False,
            )
            or
            categorical_evidence.get(
                "frequency_changes",
                False,
            )
        )

    # --------------------------------------------------
    # Determine final status
    # --------------------------------------------------
    #
    # Statistical evidence has priority.
    #
    # If a reliable statistical test detects drift:
    #     DRIFT_DETECTED
    #
    # If there is only descriptive categorical evidence
    # without statistically reliable support:
    #     DRIFT_SUSPECTED
    #
    # Otherwise:
    #     NO_DRIFT
    # --------------------------------------------------

    if severity != "NONE":

        status = "DRIFT_DETECTED"

    elif categorical_drift:

        status = "DRIFT_SUSPECTED"

    else:

        status = "NO_DRIFT"

    # --------------------------------------------------
    # Contribution
    # --------------------------------------------------

    contribution = calculate_feature_contribution(
        severity,
        importance,
    )

    # --------------------------------------------------
    # Decision trace
    # --------------------------------------------------

    decision_trace = list(
        significant_tests
    )

    if categorical_drift:
        decision_trace.append(
            "categorical_evidence"
        )

    # --------------------------------------------------
    # Final assessment
    # --------------------------------------------------

    return {
        "feature": feature,

        "feature_type": feature_type,

        "status": status,

        "severity": severity,

        "importance": importance,

        "confidence": confidence,

        "contribution": contribution,

        "evidence": {
            "tests": feature_result.get(
                "tests",
                {},
            ),

            "additional_evidence":
                feature_result.get(
                    "evidence",
                    {},
                ),
        },

        "decision_trace": decision_trace,

        "recommendation": None,
    }


# ============================================================
# Feature importance
# ============================================================

def get_feature_importance(
    feature,
    importance_map=None,
):
    if (
        importance_map
        and feature in importance_map
    ):
        return importance_map[feature]

    return DEFAULT_FEATURE_IMPORTANCE


# ============================================================
# Confidence
# ============================================================

def calculate_confidence(
    feature_result,
    psi_threshold=PSI_THRESHOLD,
):
    """
    Determine confidence in the feature-level decision.

    HIGH:
        All available tests provide reliable evidence.

    MEDIUM:
        Some tests are reliable and some are not.

    LOW:
        No statistically reliable test exists.

    Important:
        Descriptive categorical evidence does not increase
        statistical confidence.
    """

    tests = feature_result.get(
        "tests",
        {},
    )

    if not tests:
        return "LOW"

    total_tests = 0
    reliable_tests = 0

    for test_name, test_result in tests.items():

        # --------------------------------------------------
        # PSI
        # --------------------------------------------------

        if test_name == "psi":

            total_tests += 1

            # PSI does not currently provide separate
            # validity metadata, so treat the calculation
            # itself as valid evidence.
            reliable_tests += 1

            continue

        # --------------------------------------------------
        # Other statistical tests
        # --------------------------------------------------

        if not isinstance(test_result, dict):
            continue

        total_tests += 1

        validity = test_result.get(
            "validity"
        )

        # No validity metadata means we accept the test
        # as statistically usable.
        if validity is None:
            reliable_tests += 1
            continue

        if validity.get(
            "statistically_reliable",
            False,
        ):
            reliable_tests += 1

    if total_tests == 0:
        return "LOW"

    reliability_ratio = (
        reliable_tests / total_tests
    )

    if reliability_ratio >= 0.75:
        return "HIGH"

    if reliability_ratio >= 0.5:
        return "MEDIUM"

    return "LOW"


# ============================================================
# Feature contribution
# ============================================================

def calculate_feature_contribution(
    severity,
    importance,
):
    severity_scores = {
        "NONE": 0.0,
        "LOW": 1 / 3,
        "MEDIUM": 2 / 3,
        "HIGH": 1.0,
    }

    importance_scores = {
        "LOW": 1 / 3,
        "MEDIUM": 2 / 3,
        "HIGH": 1.0,
    }

    severity_score = severity_scores.get(
        severity,
        0.0,
    )

    importance_score = importance_scores.get(
        importance,
        0.0,
    )

    return (
        0.55 * severity_score
        + 0.45 * importance_score
    )


# ============================================================
# PSI evaluation
# ============================================================

def evaluate_psi(
    psi_value,
    threshold=PSI_THRESHOLD,
):
    psi_value = float(psi_value)
    threshold = float(threshold)

    return {
        "value": psi_value,

        "threshold": threshold,

        "significant": bool(
            psi_value >= threshold
        ),
    }


# ============================================================
# Categorical evidence
# ============================================================

def evaluate_categorical_evidence(
    feature_result,
):
    evidence = feature_result.get(
        "evidence",
        {},
    )

    categorical = evidence.get(
        "categorical",
        {},
    )

    new_categories = categorical.get(
        "new_categories",
        [],
    )

    disappeared_categories = categorical.get(
        "disappeared_categories",
        [],
    )

    frequency_changes = categorical.get(
        "frequency_changes",
        {},
    )

    has_category_changes = bool(
        new_categories
        or disappeared_categories
    )

    has_frequency_changes = any(
        details.get(
            "change",
            0,
        ) != 0
        for details
        in frequency_changes.values()
    )

    return {
        "category_changes":
            has_category_changes,

        "frequency_changes":
            has_frequency_changes,

        "new_categories":
            new_categories,

        "disappeared_categories":
            disappeared_categories,
    }