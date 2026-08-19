from pathlib import Path

from fastapi import FastAPI

from main import analyze_datasets
from decision.pipeline import run_decision_engine
from decision.report import build_report


app = FastAPI(
    title="Drift Monitor API",
    description="API for dataset drift analysis and model health assessment",
    version="1.0.0",
)

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

BASELINE_PATH = PROJECT_ROOT / "datasets" / "baseline.csv"
CURRENT_PATH = PROJECT_ROOT / "datasets" / "current.csv"


@app.get("/")
def root():
    return {
        "message": "Drift Monitor API is running"
    }


@app.get("/analyze")
def analyze():
    result = analyze_datasets(
        str(BASELINE_PATH),
        str(CURRENT_PATH),
    )

    decision_result = run_decision_engine(
        result["features"],
    )

    report = build_report(
        decision_result
    )

    return report