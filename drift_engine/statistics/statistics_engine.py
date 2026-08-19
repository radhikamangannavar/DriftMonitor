import pandas as pd


def calculate_descriptive_statistics(dataframe):
    numerical_statistics = dataframe.describe(
        include=["number"]
    ).to_dict()

    return numerical_statistics

def calculate_quantiles(dataframe):
    numerical_columns = dataframe.select_dtypes(
        include=["number"]
    ).columns

    quantiles = {}

    for column in numerical_columns:
        quantiles[column] = {
            "25%": float(dataframe[column].quantile(0.25)),
            "50%": float(dataframe[column].quantile(0.50)),
            "75%": float(dataframe[column].quantile(0.75)),
        }

    return quantiles

def calculate_frequency_distributions(dataframe):
    categorical_columns = dataframe.select_dtypes(
        exclude=["number"]
    ).columns

    frequencies = {}

    for column in categorical_columns:
        frequencies[column] = (
            dataframe[column]
            .value_counts(dropna=False)
            .to_dict()
        )

    return frequencies

def calculate_bins(dataframe, column, bins=10):
    values = dataframe[column].dropna()

    if values.empty:
        return []

    counts, bin_edges = pd.cut(
        values,
        bins=bins,
        retbins=True,
        include_lowest=True,
    )

    frequency = counts.value_counts().sort_index()

    return {
        "bin_edges": bin_edges.tolist(),
        "frequencies": frequency.tolist(),
    }