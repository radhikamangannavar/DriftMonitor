def calculate_categorical_evidence(baseline, current):
    baseline_counts = baseline.value_counts(dropna=False)
    current_counts = current.value_counts(dropna=False)

    baseline_categories = set(baseline_counts.index)
    current_categories = set(current_counts.index)

    new_categories = sorted(
        current_categories - baseline_categories,
        key=str
    )

    disappeared_categories = sorted(
        baseline_categories - current_categories,
        key=str
    )

    common_categories = baseline_categories & current_categories

    frequency_changes = {}

    for category in common_categories:
        baseline_frequency = baseline_counts[category] / len(baseline)
        current_frequency = current_counts[category] / len(current)

        frequency_changes[str(category)] = {
            "baseline_frequency": float(baseline_frequency),
            "current_frequency": float(current_frequency),
            "change": float(
                current_frequency - baseline_frequency
            ),
        }

    missing_baseline = int(baseline.isna().sum())
    missing_current = int(current.isna().sum())

    return {
        "new_categories": [str(category) for category in new_categories],
        "disappeared_categories": [
            str(category) for category in disappeared_categories
        ],
        "frequency_changes": frequency_changes,
        "missing_percentage": {
            "baseline": float(missing_baseline / len(baseline) * 100),
            "current": float(missing_current / len(current) * 100),
        },
        "unique_category_count": {
            "baseline": int(baseline.nunique(dropna=True)),
            "current": int(current.nunique(dropna=True)),
        },
    }