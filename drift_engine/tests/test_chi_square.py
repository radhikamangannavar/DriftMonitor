from drift.chi_square import calculate_chi_square
import pandas as pd


baseline = pd.Series([
    "A", "A", "A", "B", "B", "B", "C", "C", "C", "C"
])

current = pd.Series([
    "A", "A", "B", "B", "B", "C", "C", "C", "C", "C"
])

result = calculate_chi_square(
    baseline,
    current
)

print("Chi-Square Result:")
print(result)