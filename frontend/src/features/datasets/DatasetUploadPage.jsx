import { useEffect, useRef, useState } from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  Upload,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { api } from "../../services/api";

import "./datasets.css";


function DatasetUploadPage() {
  const navigate = useNavigate();

  const fileInputRef =
    useRef(null);


  const [models, setModels] =
    useState([]);

  const [loadingModels, setLoadingModels] =
    useState(true);

  const [name, setName] =
    useState("");

  const [type, setType] =
    useState("baseline");

  const [modelId, setModelId] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  const user = JSON.parse(
    sessionStorage.getItem(
      "driftmonitor_user"
    ) || "null"
  );


  useEffect(() => {
    async function loadModels() {
      if (!user?.organizationId) {
        setError(
          "Organization information is missing."
        );

        setLoadingModels(false);

        return;
      }

      try {
        const result =
          await api.get(
            `/models/organization/${user.organizationId}`
          );

        const modelData =
          result.data || [];

        setModels(modelData);

        if (modelData.length > 0) {
          setModelId(
            modelData[0]._id
          );
        }

      } catch (err) {
        setError(
          err.message ||
            "Unable to load models."
        );
      } finally {
        setLoadingModels(false);
      }
    }

    loadModels();
  }, [user?.organizationId]);


  const handleFileChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please select a CSV file."
      );

      return;
    }

    setError("");
    setFile(selectedFile);

    if (!name) {
      const cleanName =
        selectedFile.name
          .replace(/\.csv$/i, "")
          .replace(/[-_]+/g, " ");

      setName(
        cleanName
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          )
      );
    }
  };


  const removeFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };


  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (!droppedFile) {
      return;
    }

    if (
      !droppedFile.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Please select a CSV file."
      );

      return;
    }

    setError("");
    setFile(droppedFile);

    if (!name) {
      const cleanName =
        droppedFile.name
          .replace(/\.csv$/i, "")
          .replace(/[-_]+/g, " ");

      setName(
        cleanName
          .replace(
            /\b\w/g,
            (letter) =>
              letter.toUpperCase()
          )
      );
    }
  };


  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");


    if (!name.trim()) {
      setError(
        "Dataset name is required."
      );

      return;
    }

    if (!modelId) {
      setError(
        "Please select a model."
      );

      return;
    }

    if (!file) {
      setError(
        "Please select a CSV file."
      );

      return;
    }


    try {
      setSubmitting(true);


      const formData =
        new FormData();

      /*
        IMPORTANT:
        organizationId and uploadedBy
        are deliberately NOT sent.

        The backend gets both from
        req.session.
      */

      formData.append(
        "name",
        name.trim()
      );

      formData.append(
        "type",
        type
      );

      formData.append(
        "modelId",
        modelId
      );

      formData.append(
        "file",
        file
      );


      await api.postForm(
        "/datasets/upload",
        formData
      );


      navigate(
        "/app/datasets"
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to upload dataset."
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="dataset-upload-page">

      {/* -----------------------------------------
          BACK
      ------------------------------------------ */}

      <Link
        to="/app/datasets"
        className="datasets-back"
      >
        <ArrowLeft size={14} />

        Back to datasets
      </Link>


      {/* -----------------------------------------
          INTRO
      ------------------------------------------ */}

      <section className="dataset-upload-intro">

        <div className="datasets-kicker">
          UPLOAD DATASET
        </div>

        <h1>
          Add data to
          <br />
          your model.
        </h1>

        <p>
          Upload a CSV dataset to use as
          a baseline or current observation
          for statistical drift analysis.
        </p>

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
          FORM
      ------------------------------------------ */}

      <form
        className="dataset-upload-form"
        onSubmit={handleSubmit}
      >

        {/* ---------------------------------------
            01 — DETAILS
        ---------------------------------------- */}

        <section className="dataset-form-section">

          <div className="dataset-form-heading">

            <span>
              01
            </span>

            <div>

              <h2>
                Dataset details
              </h2>

              <p>
                Define what this dataset
                represents in your monitoring
                workflow.
              </p>

            </div>

          </div>


          <div className="dataset-form-fields">

            <div className="dataset-field">

              <label>
                Dataset name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="e.g. Production Baseline"
              />

            </div>


            <div className="dataset-field">

              <label>
                Dataset type
              </label>

              <div className="dataset-type-options">

                <button
                  type="button"
                  className={
                    type === "baseline"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setType(
                      "baseline"
                    )
                  }
                >

                  <span className="dataset-radio">
                    {type ===
                      "baseline" && (
                      <Check size={11} />
                    )}
                  </span>

                  <span>

                    <strong>
                      Baseline
                    </strong>

                    <small>
                      Reference distribution
                    </small>

                  </span>

                </button>


                <button
                  type="button"
                  className={
                    type === "current"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setType(
                      "current"
                    )
                  }
                >

                  <span className="dataset-radio">
                    {type ===
                      "current" && (
                      <Check size={11} />
                    )}
                  </span>

                  <span>

                    <strong>
                      Current
                    </strong>

                    <small>
                      Production observation
                    </small>

                  </span>

                </button>

              </div>

            </div>


            <div className="dataset-field">

              <label>
                Model
              </label>

              {loadingModels ? (

                <div className="dataset-select-loading">
                  Loading models...
                </div>

              ) : models.length === 0 ? (

                <div className="dataset-no-models">
                  No models available.
                </div>

              ) : (

                <select
                  value={modelId}
                  onChange={(event) =>
                    setModelId(
                      event.target.value
                    )
                  }
                >

                  {models.map(
                    (model) => (
                      <option
                        key={model._id}
                        value={model._id}
                      >
                        {model.name}
                      </option>
                    )
                  )}

                </select>

              )}

            </div>

          </div>

        </section>


        {/* ---------------------------------------
            02 — FILE
        ---------------------------------------- */}

        <section className="dataset-form-section">

          <div className="dataset-form-heading">

            <span>
              02
            </span>

            <div>

              <h2>
                CSV file
              </h2>

              <p>
                Upload the data file that
                will be processed by the
                drift engine.
              </p>

            </div>

          </div>


          <div className="dataset-file-area">

            {!file ? (

              <button
                type="button"
                className="dataset-dropzone"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={handleDrop}
              >

                <div className="dataset-drop-icon">
                  <Upload size={19} />
                </div>

                <strong>
                  Drop your CSV here
                </strong>

                <span>
                  or choose a file from your computer
                </span>

                <small>
                  CSV files only
                </small>

              </button>

            ) : (

              <div className="dataset-selected-file">

                <div className="dataset-selected-icon">
                  <FileText size={18} />
                </div>

                <div>

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </span>

                </div>

                <button
                  type="button"
                  onClick={removeFile}
                  className="dataset-remove-file"
                >
                  <X size={15} />
                </button>

              </div>

            )}


            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              hidden
            />

          </div>

        </section>


        {/* ---------------------------------------
            SUBMIT
        ---------------------------------------- */}

        <div className="dataset-upload-submit">

          <div>

            <span>
              READY TO UPLOAD
            </span>

            <p>
              The dataset will be associated
              with the selected model.
            </p>

          </div>


          <button
            type="submit"
            disabled={
              submitting ||
              loadingModels ||
              models.length === 0
            }
          >

            {submitting
              ? "Uploading..."
              : "Upload dataset"}

            <ArrowUpRight size={14} />

          </button>

        </div>

      </form>

    </div>
  );
}


export default DatasetUploadPage;