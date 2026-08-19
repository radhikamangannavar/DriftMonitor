from pathlib import Path

from inspector.dataset_inspector import (
    load_dataset,
    validate_dataset,
    detect_feature_types,
    check_missing_values,
    filter_outliers,
)

from drift.psi import calculate_psi
from drift.ks import calculate_ks
from drift.chi_square import calculate_chi_square
from drift.categorical_evidence import calculate_categorical_evidence
from drift.drift_result import build_drift_result

from decision.pipeline import run_decision_engine
from decision.report import build_report, save_report_json


def analyze_datasets(baseline_path, current_path):
    baseline = load_dataset(baseline_path)
    current = load_dataset(current_path)

    validate_dataset(baseline)
    validate_dataset(current)

    baseline_features = detect_feature_types(baseline)
    current_features = detect_feature_types(current)

    baseline_missing = check_missing_values(baseline)
    current_missing = check_missing_values(current)

    baseline = filter_outliers(baseline)
    current = filter_outliers(current)

    results = []

    common_numerical = sorted(
        set(baseline_features["numerical"])
        & set(current_features["numerical"])
    )

    common_categorical = sorted(
        set(baseline_features["categorical"])
        & set(current_features["categorical"])
    )

    for feature in common_numerical:
        psi = calculate_psi(
            baseline[feature].dropna(),
            current[feature].dropna(),
        )

        ks = calculate_ks(
            baseline[feature].dropna(),
            current[feature].dropna(),
        )

        results.append(
            build_drift_result(
                feature=feature,
                feature_type="numerical",
                psi=psi,
                ks=ks,
            )
        )

    for feature in common_categorical:
        chi_square = calculate_chi_square(
            baseline[feature],
            current[feature],
        )

        categorical_evidence = calculate_categorical_evidence(
            baseline[feature],
            current[feature],
        )

        results.append(
            build_drift_result(
                feature=feature,
                feature_type="categorical",
                chi_square=chi_square,
                categorical_evidence=categorical_evidence,
            )
        )

    return {
        "baseline": {
            "rows": len(baseline),
            "missing_values": baseline_missing,
        },
        "current": {
            "rows": len(current),
            "missing_values": current_missing,
        },
        "features": results,
    }


if __name__ == "__main__":
    import sys
    import json

    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python main.py <baseline_path> <current_path>"
        }))
        sys.exit(1)

    baseline_path = Path(sys.argv[1]).resolve()
    current_path = Path(sys.argv[2]).resolve()

    try:
        result = analyze_datasets(
            baseline_path,
            current_path,
        )

        decision_result = run_decision_engine(
            result["features"],
        )

        report = build_report(
            decision_result
        )

        # Save report for debugging/auditing
        engine_root = Path(__file__).resolve().parent

        save_report_json(
            report,
            engine_root / "reports" / "drift_report.json",
        )

        # IMPORTANT:
        # Express will read this JSON from stdout
        print(json.dumps({
            "success": True,
            "report": report
        }))

    except Exception as error:
        print(json.dumps({
            "success": False,
            "error": str(error)
        }))

        sys.exit(1)