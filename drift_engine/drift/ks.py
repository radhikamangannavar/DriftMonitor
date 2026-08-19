from scipy.stats import ks_2samp


def calculate_ks(baseline, current, alpha=0.05):
    statistic, p_value = ks_2samp(baseline, current)

    return {
        "statistic": float(statistic),
        "p_value": float(p_value),
        "alpha": alpha,
        "significant": bool(p_value < alpha),
    }