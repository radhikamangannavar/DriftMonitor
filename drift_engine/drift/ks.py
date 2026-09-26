from scipy.stats import ks_2samp


MIN_SAMPLE_SIZE = 30


def calculate_ks(
    baseline,
    current,
    alpha=0.05,
):
    baseline = list(baseline)
    current = list(current)

    if len(baseline) == 0 or len(current) == 0:
        raise ValueError(
            "Baseline and current data must contain values"
        )

    statistic, p_value = ks_2samp(
        baseline,
        current,
    )

    minimum_sample_size = min(
        len(baseline),
        len(current),
    )

    return {
        "statistic": float(statistic),
        "p_value": float(p_value),
        "alpha": float(alpha),
        "significant": bool(
            p_value < alpha
        ),
        "sample_size": {
            "baseline": len(baseline),
            "current": len(current),
            "minimum": minimum_sample_size,
            "adequate": bool(
                minimum_sample_size >= MIN_SAMPLE_SIZE
            ),
        },
    }