import numpy as np


DEFAULT_BIN_COUNT = 10
MIN_BIN_PROPORTION = 0.01


def _clean_values(values):
    """
    Convert values to numeric numpy array and remove NaN/inf.
    """
    values = np.asarray(values, dtype=float)

    values = values[np.isfinite(values)]

    if len(values) == 0:
        raise ValueError(
            "No valid numeric values available"
        )

    return values


def create_bins(
    baseline,
    bin_count=DEFAULT_BIN_COUNT,
):
    """
    Create stable PSI bins using the baseline distribution.

    Quantile bins are used when the baseline has enough unique
    values. The outer bins are extended to infinity so values
    outside the baseline range are not artificially compressed
    into a boundary bin.

    The baseline remains the reference population.
    """

    baseline = _clean_values(baseline)

    try:
        bin_count = int(bin_count)
    except (TypeError, ValueError):
        raise ValueError(
            "bin_count must be an integer"
        )

    if bin_count < 2:
        raise ValueError(
            "bin_count must be at least 2"
        )

    unique_values = np.unique(baseline)

    # Constant feature.
    if len(unique_values) == 1:
        value = unique_values[0]

        return np.array([
            -np.inf,
            value,
            np.inf,
        ])

    # Never create more bins than the data can support.
    actual_bins = min(
        bin_count,
        len(unique_values),
        max(2, len(baseline) // 5),
    )

    # Quantile boundaries.
    quantiles = np.linspace(
        0,
        1,
        actual_bins + 1,
    )

    bins = np.quantile(
        baseline,
        quantiles,
    )

    # Remove duplicate boundaries caused by repeated values.
    bins = np.unique(bins)

    if len(bins) < 2:
        value = unique_values[0]

        return np.array([
            -np.inf,
            value,
            np.inf,
        ])

    # Extend the outer boundaries.
    #
    # This is important:
    # values outside the baseline range must remain represented
    # without being silently forced into an arbitrary finite edge.
    bins[0] = -np.inf
    bins[-1] = np.inf

    return bins


def _calculate_bin_proportions(
    values,
    bins,
):
    """
    Calculate normalized proportions for the supplied bins.
    """

    values = _clean_values(values)

    counts, _ = np.histogram(
        values,
        bins=bins,
    )

    proportions = (
        counts.astype(float)
        / len(values)
    )

    return proportions


def _apply_proportion_floor(
    proportions,
    minimum,
):
    """
    Apply a minimum probability to every bin and renormalize.

    This prevents log(0) while keeping the distribution valid.
    """

    proportions = np.asarray(
        proportions,
        dtype=float,
    )

    proportions = np.maximum(
        proportions,
        minimum,
    )

    total = proportions.sum()

    if total <= 0:
        raise ValueError(
            "Invalid probability distribution"
        )

    return proportions / total


def calculate_psi(
    baseline,
    current,
    bins=None,
    bin_count=DEFAULT_BIN_COUNT,
    min_bin_proportion=MIN_BIN_PROPORTION,
):
    """
    Calculate Population Stability Index (PSI).

    Formula:

        PSI = Σ (current - baseline)
                    * log(current / baseline)

    Baseline defines the reference bins.

    Zero-proportion bins receive a small floor to avoid
    log(0), followed by renormalization.
    """

    baseline = _clean_values(baseline)
    current = _clean_values(current)

    if not (
        0 < float(min_bin_proportion) < 0.5
    ):
        raise ValueError(
            "min_bin_proportion must be between 0 and 0.5"
        )

    if bins is None:
        bins = create_bins(
            baseline,
            bin_count=bin_count,
        )

    bins = np.asarray(
        bins,
        dtype=float,
    )

    if len(bins) < 2:
        raise ValueError(
            "At least two bin edges are required"
        )

    finite_bins = bins[
        np.isfinite(bins)
    ]

    if len(finite_bins) > 1:
        if not np.all(
            np.diff(finite_bins) > 0
        ):
            raise ValueError(
                "Bin edges must be strictly increasing"
            )

    baseline_proportions = (
        _calculate_bin_proportions(
            baseline,
            bins,
        )
    )

    current_proportions = (
        _calculate_bin_proportions(
            current,
            bins,
        )
    )

    baseline_proportions = (
        _apply_proportion_floor(
            baseline_proportions,
            float(min_bin_proportion),
        )
    )

    current_proportions = (
        _apply_proportion_floor(
            current_proportions,
            float(min_bin_proportion),
        )
    )

    psi_components = (
        (
            current_proportions
            - baseline_proportions
        )
        *
        np.log(
            current_proportions
            / baseline_proportions
        )
    )

    return float(
        np.sum(psi_components)
    )