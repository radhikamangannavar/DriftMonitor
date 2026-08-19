from drift.categorical_evidence import calculate_categorical_evidence
import pandas as pd


baseline = pd.Series([
    "A", "A", "A", "B", "B", "C"
])

current = pd.Series([
    "A", "A", "B", "B", "B", "D"
])

result = calculate_categorical_evidence(
    baseline,
    current
)

print("Categorical Evidence:")
print(result)