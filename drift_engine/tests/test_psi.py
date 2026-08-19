import numpy as np

from drift.psi import calculate_psi


baseline = np.array([10, 12, 14, 15, 16, 18, 20, 21, 22, 24])
current = np.array([10, 11, 13, 14, 15, 17, 19, 20, 21, 23])

bins = [10, 15, 20, 25]

psi = calculate_psi(
    baseline,
    current,
    bins
)

print("PSI:", psi)