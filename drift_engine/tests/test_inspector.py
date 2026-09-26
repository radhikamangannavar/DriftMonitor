from inspector.dataset_inspector import (
    load_dataset,
    validate_dataset,
    detect_feature_types,
    check_missing_values,
    detect_outliers,
)


file_path = "../datasets/inspector_test.csv"

dataframe = load_dataset(file_path)

validate_dataset(dataframe)

feature_types = detect_feature_types(dataframe)

missing_values = check_missing_values(dataframe)

outlier_evidence = detect_outliers(dataframe)


print("Feature Types:")
print(feature_types)

print("\nMissing Values:")
print(missing_values)

print("\nOutlier Evidence:")
print(outlier_evidence)

print("\nOriginal Rows:", len(dataframe))
print("Rows After Analysis:", len(dataframe))