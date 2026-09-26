import pandas as pd


# Identifier naming patterns.
IDENTIFIER_NAME_PATTERNS = (
    "_id",
    "_uuid",
    "_guid",
    "_identifier",
)


def load_dataset(file_path):
    try:
        dataframe = pd.read_csv(file_path)

        if dataframe.empty:
            raise ValueError("Dataset is empty")

        return dataframe

    except FileNotFoundError:
        raise ValueError(
            f"Dataset file not found: {file_path}"
        )

    except pd.errors.EmptyDataError:
        raise ValueError("Dataset file is empty")

    except pd.errors.ParserError:
        raise ValueError("Invalid CSV format")


def validate_dataset(dataframe):
    if dataframe is None:
        raise ValueError("Dataset could not be loaded")

    if dataframe.empty:
        raise ValueError("Dataset is empty")

    if len(dataframe.columns) == 0:
        raise ValueError("Dataset has no columns")

    return True


def is_identifier_column(dataframe, column):
    """
    Determine whether a column is likely to be an identifier.

    Identifier detection is primarily name-based.
    We deliberately do not use uniqueness alone because
    legitimate numerical features such as income can naturally
    contain mostly unique values.
    """

    normalized_name = (
        str(column)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )

    # Exact identifier names.
    if normalized_name in {
        "id",
        "uuid",
        "guid",
        "identifier",
    }:
        return True

    # Identifier-style suffixes.
    if normalized_name.endswith(
        IDENTIFIER_NAME_PATTERNS
    ):
        return True

    return False


def detect_feature_types(dataframe):
    numerical_features = []
    categorical_features = []
    identifier_features = []

    for column in dataframe.columns:

        if is_identifier_column(
            dataframe,
            column,
        ):
            identifier_features.append(column)
            continue

        if pd.api.types.is_numeric_dtype(
            dataframe[column]
        ):
            numerical_features.append(column)

        else:
            categorical_features.append(column)

    return {
        "numerical": numerical_features,
        "categorical": categorical_features,
        "identifier": identifier_features,
    }


def check_missing_values(dataframe):
    missing_counts = dataframe.isnull().sum()

    return {
        column: int(count)
        for column, count in missing_counts.items()
        if count > 0
    }

def detect_outliers(dataframe):
    """
    Detect numerical outliers using the IQR method.

    Outliers are reported as evidence only. The original
    dataframe is not modified.
    """

    outlier_evidence = {}

    numerical_features = (
        dataframe
        .select_dtypes(include=["number"])
        .columns
    )

    for column in numerical_features:
        values = dataframe[column].dropna()

        if values.empty:
            continue

        q1 = values.quantile(0.25)
        q3 = values.quantile(0.75)

        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        outlier_mask = (
            (values < lower_bound)
            | (values > upper_bound)
        )

        outlier_count = int(outlier_mask.sum())

        outlier_evidence[column] = {
            "count": outlier_count,
            "percentage": float(
                outlier_count / len(values)
            ),
            "lower_bound": float(lower_bound),
            "upper_bound": float(upper_bound),
        }

    return outlier_evidence