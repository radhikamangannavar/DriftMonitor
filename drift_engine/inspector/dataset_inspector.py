import pandas as pd


def load_dataset(file_path):
    try:
        dataframe = pd.read_csv(file_path)

        if dataframe.empty:
            raise ValueError("Dataset is empty")

        return dataframe

    except FileNotFoundError:
        raise ValueError(f"Dataset file not found: {file_path}")

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

def detect_feature_types(dataframe):
    numerical_features = dataframe.select_dtypes(
        include=["number"]
    ).columns.tolist()

    categorical_features = dataframe.select_dtypes(
        exclude=["number"]
    ).columns.tolist()

    return {
        "numerical": numerical_features,
        "categorical": categorical_features,
    }

def check_missing_values(dataframe):
    missing_counts = dataframe.isnull().sum()

    return {
        column: int(count)
        for column, count in missing_counts.items()
        if count > 0
    }
    
def filter_outliers(dataframe):
    filtered_dataframe = dataframe.copy()

    numerical_features = filtered_dataframe.select_dtypes(
        include=["number"]
    ).columns

    for column in numerical_features:
        q1 = filtered_dataframe[column].quantile(0.25)
        q3 = filtered_dataframe[column].quantile(0.75)

        iqr = q3 - q1

        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr

        filtered_dataframe = filtered_dataframe[
            (filtered_dataframe[column] >= lower_bound)
            & (filtered_dataframe[column] <= upper_bound)
        ]

    return filtered_dataframe