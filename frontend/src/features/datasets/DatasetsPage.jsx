import { useEffect, useState } from "react";

import {
  ArrowUpRight,
  Database,
  FileText,
  RefreshCw,
  Upload,
} from "lucide-react";

import { Link } from "react-router-dom";

import { api } from "../../services/api";

import "./datasets.css";


function DatasetsPage() {
  const [datasets, setDatasets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadDatasets = async () => {
  try {
    setLoading(true);
    setError("");

    const result =
      await api.get("/datasets");

    setDatasets(
      result.data || []
    );
  } catch (err) {
    setError(
      err.message ||
        "Unable to load datasets."
    );
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadDatasets();
  }, []);


  return (
    <div className="datasets-page">

      {/* -----------------------------------------
          INTRO
      ------------------------------------------ */}

      <section className="datasets-intro">

        <div>

          <div className="datasets-kicker">
            DATASETS
          </div>

          <h1>
            Your model
            <br />
            data.
          </h1>

          <p>
            Upload and manage the baseline
            and current datasets used to
            measure statistical drift.
          </p>

        </div>


        <Link
          to="/app/datasets/upload"
          className="datasets-upload-button"
        >
          <Upload size={15} />

          Upload dataset
        </Link>

      </section>


      {/* -----------------------------------------
          ERROR
      ------------------------------------------ */}

      {error && (
        <div className="datasets-error">
          {error}
        </div>
      )}


      {/* -----------------------------------------
          SUMMARY
      ------------------------------------------ */}

      <section className="datasets-summary">

        <div>

          <strong>
            {loading
              ? "—"
              : datasets.length}
          </strong>

          <span>
            datasets
          </span>

        </div>

        <button
          type="button"
          onClick={loadDatasets}
          className="datasets-refresh"
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "is-spinning"
                : ""
            }
          />

          Refresh
        </button>

      </section>


      {/* -----------------------------------------
          DATASET LIST
      ------------------------------------------ */}

      <section className="datasets-list">

        <div className="datasets-list-header">

          <span>
            DATASET
          </span>

          <span>
            TYPE
          </span>

          <span>
            MODEL
          </span>

          <span>
            UPLOADED
          </span>

          <span />

        </div>


        {loading ? (

          <div className="datasets-state">
            Loading datasets...
          </div>

        ) : datasets.length === 0 ? (

          <div className="datasets-empty">

            <div className="datasets-empty-icon">
              <Database size={20} />
            </div>

            <h2>
              No datasets yet
            </h2>

            <p>
              Upload a baseline dataset and
              current dataset to begin drift
              analysis.
            </p>

            <Link
              to="/app/datasets/upload"
              className="datasets-empty-button"
            >
              Upload your first dataset

              <ArrowUpRight size={14} />
            </Link>

          </div>

        ) : (

          <div className="datasets-rows">

            {datasets.map(
              (dataset) => (
                <div
                  key={dataset._id}
                  className="dataset-row"
                >

                  <div className="dataset-name">

                    <div className="dataset-file-icon">
                      <FileText size={16} />
                    </div>

                    <div>

                      <strong>
                        {dataset.name}
                      </strong>

                      <span>
                        {dataset.fileName}
                      </span>

                    </div>

                  </div>


                  <div>
                    <span
                      className={`dataset-type ${dataset.type}`}
                    >
                      {dataset.type}
                    </span>
                  </div>


                  <div className="dataset-model">
                    {dataset.modelId?.name ||
                      "Unknown model"}
                  </div>


                  <div className="dataset-date">
                    {dataset.createdAt
                      ? new Date(
                          dataset.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </div>


                  <ArrowUpRight
                    size={15}
                    className="dataset-row-arrow"
                  />

                </div>
              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default DatasetsPage;