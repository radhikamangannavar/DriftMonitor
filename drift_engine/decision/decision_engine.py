from .config import DEFAULT_FEATURE_IMPORTANCE, PSI_THRESHOLD
def assess_feature_severity(feature_result):
    tests = feature_result.get("tests", {})

    significant_tests = []

    for test_name, test_result in tests.items():

        if test_name == "psi":
            psi_result = evaluate_psi(test_result)

            if psi_result["significant"]:
                significant_tests.append("psi")

        elif isinstance(test_result, dict):
            if test_result.get("significant") is True:
                significant_tests.append(test_name)

    if not significant_tests:
        severity = "NONE"
    elif len(significant_tests) == 1:
        severity = "MEDIUM"
    else:
        severity = "HIGH"

    return {
        "severity": severity,
        "significant_tests": significant_tests,
    }
    
def build_feature_assessment(feature_result, importance_map=None):
    severity_result = assess_feature_severity(feature_result)

    feature = feature_result["feature"]
    severity = severity_result["severity"]

    importance = get_feature_importance(
        feature,
        importance_map
    )

    confidence = calculate_confidence(
        feature_result
    )

    contribution = calculate_feature_contribution(
        severity,
        importance
    )

    return {
        "feature": feature,
        "feature_type": feature_result["feature_type"],
        "status": (
    "DRIFT_DETECTED"
    if severity != "NONE"
    else "NO_DRIFT"
),
        "severity": severity,
        "importance": importance,
        "confidence": confidence,
        "contribution": contribution,
        "evidence": {
            "tests": feature_result.get("tests", {}),
            "additional_evidence": feature_result.get("evidence", {}),
        },
        "decision_trace": (
    severity_result.get("significant_tests", [])
    + (
        ["categorical_evidence"]
        if feature_result["feature_type"] == "categorical"
        and (
            evaluate_categorical_evidence(
                feature_result
            )["category_changes"]
            or evaluate_categorical_evidence(
                feature_result
            )["frequency_changes"]
        )
        else []
    )
),
        "recommendation": None,
    }
    
    
def get_feature_importance(feature, importance_map=None):
    if importance_map and feature in importance_map:
        return importance_map[feature]

    return DEFAULT_FEATURE_IMPORTANCE

def calculate_confidence(feature_result):
    tests = feature_result.get("tests", {})

    significant_count = 0
    total_tests = 0

    for test_name, test_result in tests.items():

        if test_name == "psi":
            psi_result = evaluate_psi(test_result)
            total_tests += 1

            if psi_result["significant"]:
                significant_count += 1

        elif isinstance(test_result, dict):
            total_tests += 1

            if test_result.get("significant") is True:
                significant_count += 1

    if total_tests == 0:
        return "LOW"

    confidence_score = significant_count / total_tests

    if confidence_score >= 0.75:
        return "HIGH"
    elif confidence_score >= 0.5:
        return "MEDIUM"
    else:
        return "LOW"

def calculate_feature_contribution(severity, importance):
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

    severity_score = severity_scores.get(severity, 0.0)
    importance_score = importance_scores.get(importance, 0.0)

    return (
        0.55 * severity_score
        + 0.45 * importance_score
    )
def evaluate_psi(psi_value):
    return {
        "value": float(psi_value),
        "threshold": PSI_THRESHOLD,
        "significant": bool(psi_value >= PSI_THRESHOLD),
    }
    
def evaluate_categorical_evidence(feature_result):
    evidence = feature_result.get("evidence", {})
    categorical = evidence.get("categorical", {})

    new_categories = categorical.get("new_categories", [])
    disappeared_categories = categorical.get(
        "disappeared_categories", []
    )
    frequency_changes = categorical.get(
        "frequency_changes", {}
    )

    has_category_changes = bool(
        new_categories or disappeared_categories
    )

    has_frequency_changes = any(
        details.get("change", 0) != 0
        for details in frequency_changes.values()
    )

    return {
        "category_changes": has_category_changes,
        "frequency_changes": has_frequency_changes,
        "new_categories": new_categories,
        "disappeared_categories": disappeared_categories,
    }