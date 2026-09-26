import json
import os


def build_report(decision_result):
    feature_assessments = decision_result[
        "feature_assessments"
    ]

    model_evidence = decision_result[
        "model_evidence"
    ]

    model_health = decision_result[
        "model_health"
    ]

    return {
        "summary": {
            "model_health": model_health["status"],

            "total_features": model_evidence[
                "total_features"
            ],

            "affected_features": [
                feature["feature"]
                for feature in feature_assessments
                if feature["status"]
                == "DRIFT_DETECTED"
            ],

            "suspected_features": [
                feature["feature"]
                for feature in feature_assessments
                if feature["status"]
                == "DRIFT_SUSPECTED"
            ],

            "affected_coverage": model_evidence[
                "affected_coverage"
            ],

            "severity_counts": {
                "high": model_evidence[
                    "high_severity_features"
                ],
                "medium": model_evidence[
                    "medium_severity_features"
                ],
                "low": model_evidence[
                    "low_severity_features"
                ],
            },

            "overall_confidence": model_evidence[
                "overall_confidence"
            ],
        },

        "feature_assessments": feature_assessments,

        "recommendations": decision_result[
            "recommendations"
        ],

        "decision_trace": decision_result[
            "decision_trace"
        ],
    }


def save_report_json(report, output_path):
    directory = os.path.dirname(output_path)

    if directory:
        os.makedirs(
            directory,
            exist_ok=True,
        )

    with open(
        output_path,
        "w",
    ) as file:
        json.dump(
            report,
            file,
            indent=4,
        )