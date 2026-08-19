from inspector.dataset_inspector import load_dataset
from statistics.statistics_engine import (
    calculate_descriptive_statistics,
    calculate_quantiles,
    calculate_frequency_distributions,
    calculate_bins,
)

file_path = "../datasets/inspector_test.csv"

dataframe = load_dataset(file_path)

print("Descriptive Statistics:")
print(calculate_descriptive_statistics(dataframe))

print("\nQuantiles:")
print(calculate_quantiles(dataframe))

print("\nFrequency Distributions:")
print(calculate_frequency_distributions(dataframe))

print("\nBins for age:")
print(calculate_bins(dataframe, "age"))