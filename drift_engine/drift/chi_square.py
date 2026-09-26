from scipy.stats import chi2_contingency


MIN_SAMPLE_SIZE = 30
MIN_EXPECTED_COUNT = 5


def calculate_chi_square(
    baseline,
    current,
    alpha=0.05,
):
    """
    Compare categorical distributions using Pearson's
    chi-square test.

    The baseline and current distributions are aligned
    across the union of all observed categories.

    IMPORTANT:
    A low p-value does not automatically mean the result
    is statistically reliable. We separately validate:

    1. Minimum sample size
    2. Minimum expected cell count
    """

    baseline = baseline.dropna()
    current = current.dropna()

    if len(baseline) == 0:
        raise ValueError(
            "Baseline data must contain valid categorical values"
        )

    if len(current) == 0:
        raise ValueError(
            "Current data must contain valid categorical values"
        )

    baseline_counts = baseline.value_counts()
    current_counts = current.value_counts()

    categories = (
        baseline_counts.index.union(
            current_counts.index
        )
    )

    baseline_counts = baseline_counts.reindex(
        categories,
        fill_value=0,
    )

    current_counts = current_counts.reindex(
        categories,
        fill_value=0,
    )

    contingency_table = [
        baseline_counts.tolist(),
        current_counts.tolist(),
    ]

    statistic, p_value, _, expected = (
        chi2_contingency(
            contingency_table
        )
    )

    expected_values = expected.flatten()

    minimum_expected_count = float(
        expected_values.min()
    )

    total_baseline = int(
        baseline_counts.sum()
    )

    total_current = int(
        current_counts.sum()
    )

    minimum_sample_size = min(
        total_baseline,
        total_current,
    )

    sample_size_adequate = bool(
        minimum_sample_size >= MIN_SAMPLE_SIZE
    )

    adequate_expected_counts = bool(
        minimum_expected_count >= MIN_EXPECTED_COUNT
    )

    statistically_reliable = bool(
        sample_size_adequate
        and adequate_expected_counts
    )

    # A chi-square result should only be considered
    # actionable when its assumptions are sufficiently met.
    significant = bool(
        p_value < alpha
        and statistically_reliable
    )

    return {
        "statistic": float(statistic),

        "p_value": float(p_value),

        "alpha": float(alpha),

        "significant": significant,

        "sample_size": {
            "baseline": total_baseline,
            "current": total_current,
            "minimum": minimum_sample_size,
            "adequate": sample_size_adequate,
        },

        "validity": {
            "minimum_expected_count":
                minimum_expected_count,

            "required_expected_count":
                MIN_EXPECTED_COUNT,

            "adequate_expected_counts":
                adequate_expected_counts,

            "statistically_reliable":
                statistically_reliable,
        },
    }