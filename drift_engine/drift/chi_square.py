from scipy.stats import chi2_contingency


def calculate_chi_square(baseline, current, alpha=0.05):
    baseline_counts = baseline.value_counts()
    current_counts = current.value_counts()

    categories = baseline_counts.index.union(current_counts.index)

    baseline_counts = baseline_counts.reindex(
        categories,
        fill_value=0
    )

    current_counts = current_counts.reindex(
        categories,
        fill_value=0
    )

    contingency_table = [
        baseline_counts.tolist(),
        current_counts.tolist()
    ]

    statistic, p_value, _, _ = chi2_contingency(
        contingency_table
    )

    return {
        "statistic": float(statistic),
        "p_value": float(p_value),
        "alpha": alpha,
        "significant": bool(p_value < alpha),
    }