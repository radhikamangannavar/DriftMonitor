import numpy as np


def create_bins(baseline, current, bin_count=10):
    combined = np.concatenate([
        np.asarray(baseline, dtype=float),
        np.asarray(current, dtype=float),
    ])

    combined = combined[~np.isnan(combined)]

    if len(combined) == 0:
        raise ValueError("No valid numerical values available for binning")

    unique_values = np.unique(combined)

    if len(unique_values) < 2:
        return np.array([
            unique_values[0] - 0.5,
            unique_values[0] + 0.5,
        ])

    total_values = len(combined)

    if total_values < 20:
        actual_bins = 2
    else:
        actual_bins = min(bin_count, len(unique_values))

    return np.linspace(
        combined.min(),
        combined.max(),
        actual_bins + 1,
    )


def calculate_psi(baseline, current, bins=None):
    baseline = np.asarray(baseline, dtype=float)
    current = np.asarray(current, dtype=float)

    baseline = baseline[~np.isnan(baseline)]
    current = current[~np.isnan(current)]

    if len(baseline) == 0 or len(current) == 0:
        raise ValueError("Baseline and current data must contain values")

    if bins is None:
        bins = create_bins(baseline, current)

    baseline_counts, _ = np.histogram(
        baseline,
        bins=bins,
    )

    current_counts, _ = np.histogram(
        current,
        bins=bins,
    )

    baseline_percentages = baseline_counts / len(baseline)
    current_percentages = current_counts / len(current)

    epsilon = 1e-10

    baseline_percentages = np.clip(
        baseline_percentages,
        epsilon,
        None,
    )

    current_percentages = np.clip(
        current_percentages,
        epsilon,
        None,
    )

    psi = np.sum(
        (current_percentages - baseline_percentages)
        * np.log(
            current_percentages / baseline_percentages
        )
    )

    return float(psi)