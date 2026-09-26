from pathlib import Path
import sys
import json

from inspector.dataset_inspector import (
    load_dataset,
    validate_dataset,
    detect_feature_types,
    check_missing_values,
    detect_outliers,
)

from drift.psi import calculate_psi
from drift.ks import calculate_ks
from drift.chi_square import calculate_chi_square
from drift.categorical_evidence import (
    calculate_categorical_evidence,
)
from drift.drift_result import build_drift_result

from decision.pipeline import run_decision_engine
from decision.report import (
    build_report,
    save_report_json,
)


DEFAULT_CONFIGURATION = {
    "psi": {
        "threshold": 0.25,
        "binCount": 10,
    },
    "ks": {
        "alpha": 0.05,
    },
    "chiSquare": {
        "alpha": 0.05,
    },
    "featureImportance": {},
}


def merge_configuration(configuration=None):
    """
    Merge supplied configuration with defaults.

    This prevents a partially supplied configuration
    from accidentally removing required defaults.
    """

    configuration = configuration or {}

    psi_config = {
        **DEFAULT_CONFIGURATION["psi"],
        **configuration.get("psi", {}),
    }

    ks_config = {
        **DEFAULT_CONFIGURATION["ks"],
        **configuration.get("ks", {}),
    }

    chi_square_config = {
        **DEFAULT_CONFIGURATION["chiSquare"],
        **configuration.get("chiSquare", {}),
    }

    feature_importance = configuration.get(
        "featureImportance",
        DEFAULT_CONFIGURATION["featureImportance"],
    )

    return {
        "psi": psi_config,
        "ks": ks_config,
        "chiSquare": chi_square_config,
        "featureImportance": feature_importance,
    }


def analyze_datasets(
    baseline_path,
    current_path,
    configuration=None,
):
    configuration = merge_configuration(
        configuration
    )

    psi_config = configuration["psi"]
    ks_config = configuration["ks"]
    chi_square_config = configuration["chiSquare"]

    psi_threshold = float(
        psi_config["threshold"]
    )

    psi_bin_count = int(
        psi_config["binCount"]
    )

    ks_alpha = float(
        ks_config["alpha"]
    )

    chi_square_alpha = float(
        chi_square_config["alpha"]
    )

    importance_map = configuration[
        "featureImportance"
    ]

    # --------------------------------------------------
    # Load datasets
    # --------------------------------------------------

    baseline = load_dataset(
        baseline_path
    )

    current = load_dataset(
        current_path
    )

    # --------------------------------------------------
    # Validate datasets
    # --------------------------------------------------

    validate_dataset(baseline)
    validate_dataset(current)

    # --------------------------------------------------
    # Detect feature types
    # --------------------------------------------------

    baseline_features = detect_feature_types(
        baseline
    )

    current_features = detect_feature_types(
        current
    )

    # --------------------------------------------------
    # Missing-value analysis
    # --------------------------------------------------

    baseline_missing = check_missing_values(
        baseline
    )

    current_missing = check_missing_values(
        current
    )

    # --------------------------------------------------
    # Outlier filtering
    # --------------------------------------------------

    baseline_outliers = detect_outliers(
        baseline
    )

    current_outliers = detect_outliers(
        current
    )

    results = []

    # --------------------------------------------------
    # Common numerical features
    # --------------------------------------------------

    common_numerical = sorted(
        set(
            baseline_features["numerical"]
        )
        &
        set(
            current_features["numerical"]
        )
    )

    # --------------------------------------------------
    # Common categorical features
    # --------------------------------------------------

    common_categorical = sorted(
        set(
            baseline_features["categorical"]
        )
        &
        set(
            current_features["categorical"]
        )
    )

    # --------------------------------------------------
    # Numerical drift
    # --------------------------------------------------

    for feature in common_numerical:

        baseline_values = (
            baseline[feature]
            .dropna()
        )

        current_values = (
            current[feature]
            .dropna()
        )

        psi = calculate_psi(
            baseline_values,
            current_values,
            bin_count=psi_bin_count,
        )

        ks = calculate_ks(
            baseline_values,
            current_values,
            alpha=ks_alpha,
        )

        results.append(
            build_drift_result(
                feature=feature,
                feature_type="numerical",
                psi=psi,
                ks=ks,
            )
        )

    # --------------------------------------------------
    # Categorical drift
    # --------------------------------------------------

    for feature in common_categorical:

        chi_square = calculate_chi_square(
            baseline[feature],
            current[feature],
            alpha=chi_square_alpha,
        )

        categorical_evidence = (
            calculate_categorical_evidence(
                baseline[feature],
                current[feature],
            )
        )

        results.append(
            build_drift_result(
                feature=feature,
                feature_type="categorical",
                chi_square=chi_square,
                categorical_evidence=(
                    categorical_evidence
                ),
            )
        )

    # --------------------------------------------------
    # Return raw analysis + effective configuration
    # --------------------------------------------------

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

        "configuration": {
            "psi_threshold": psi_threshold,
            "psi_bin_count": psi_bin_count,
            "ks_alpha": ks_alpha,
            "chi_square_alpha": chi_square_alpha,
            "feature_importance": importance_map,
        },
    }


def main():
    # --------------------------------------------------
    # Validate CLI arguments
    # --------------------------------------------------

    if len(sys.argv) not in (3, 4):
        print(
            json.dumps({
                "success": False,
                "error": (
                    "Usage: python main.py "
                    "<baseline_path> "
                    "<current_path> "
                    "[configuration_json]"
                ),
            })
        )
        sys.exit(1)

    baseline_path = Path(
        sys.argv[1]
    ).resolve()

    current_path = Path(
        sys.argv[2]
    ).resolve()

    try:
        # --------------------------------------------------
        # Read configuration
        # --------------------------------------------------

        configuration = {}

        if len(sys.argv) == 4:
            try:
                configuration = json.loads(
                    sys.argv[3]
                )
            except json.JSONDecodeError as error:
                raise ValueError(
                    f"Invalid configuration JSON: {error}"
                )

        # --------------------------------------------------
        # Analyze datasets
        # --------------------------------------------------

        result = analyze_datasets(
            baseline_path,
            current_path,
            configuration=configuration,
        )

        effective_configuration = (
            result["configuration"]
        )

        # --------------------------------------------------
        # Decision engine
        # --------------------------------------------------

        decision_result = run_decision_engine(
            result["features"],
            importance_map=(
                effective_configuration[
                    "feature_importance"
                ]
            ),
            psi_threshold=(
                effective_configuration[
                    "psi_threshold"
                ]
            ),
        )

        # --------------------------------------------------
        # Build final report
        # --------------------------------------------------

        report = build_report(
            decision_result
        )

        # --------------------------------------------------
        # Save report
        # --------------------------------------------------

        engine_root = (
            Path(__file__).resolve().parent
        )

        save_report_json(
            report,
            engine_root
            / "reports"
            / "drift_report.json",
        )

        # --------------------------------------------------
        # Return JSON to Node
        # --------------------------------------------------

        print(
            json.dumps({
                "success": True,
                "report": report,
            })
        )

    except Exception as error:

        print(
            json.dumps({
                "success": False,
                "error": str(error),
            })
        )

        sys.exit(1)


if __name__ == "__main__":
    main()