import numpy as np

from drift.ks import calculate_ks


baseline = np.array([10, 12, 14, 15, 16, 18, 20, 21, 22, 24])
current = np.array([10, 11, 13, 14, 15, 17, 19, 20, 21, 23])

result = calculate_ks(
    baseline,
    current
)

print("KS Result:")
print(result)