def build_drift_result(
    feature,
    feature_type,
    psi=None,
    ks=None,
    chi_square=None,
    categorical_evidence=None,
):
    result = {
        "feature": feature,
        "feature_type": feature_type,
        "tests": {},
        "evidence": {},
    }

    if psi is not None:
        result["tests"]["psi"] = psi

    if ks is not None:
        result["tests"]["ks"] = ks

    if chi_square is not None:
        result["tests"]["chi_square"] = chi_square

    if categorical_evidence is not None:
        result["evidence"]["categorical"] = (
            categorical_evidence
        )

    return result