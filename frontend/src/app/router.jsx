import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LandingPage from "../features/landing/LandingPage";
import LoginPage from "../features/auth/LoginPage";

import WorkspaceLayout from "../features/workspace/WorkspaceLayout";
import OverviewPage from "../features/workspace/OverviewPage";
import ModelsPage from "../features/workspace/ModelsPage";
import CreateModelPage from "../features/workspace/CreateModelPage";
import ModelDetailPage from "../features/workspace/ModelDetailPage";
import DatasetsPage from "../features/datasets/DatasetsPage";
import DatasetUploadPage from "../features/datasets/DatasetUploadPage";
import AnalysesPage from "../features/analyses/AnalysesPage";
import AnalysisDetailPage from "../features/analyses/AnalysisDetailPage";
import NewAnalysisPage from "../features/analyses/NewAnalysisPage";
import ModelConfigurationPage from "../features/workspace/ModelConfigurationPage";

function Router() {
  return (
    <Routes>

      {/* PUBLIC */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      {/* AUTHENTICATED WORKSPACE */}

      <Route
        path="/app"
        element={<WorkspaceLayout />}
      >
        <Route
          index
          element={<OverviewPage />}
        />

        <Route
          path="models"
          element={<ModelsPage />}
        />
        <Route
  path="models/new"
  element={<CreateModelPage />}
/>

        <Route
          path="models/:modelId"
          element={<ModelDetailPage />}
        />
<Route
  path="models/:modelId/configuration"
  element={<ModelConfigurationPage />}
/>
        <Route
          path="datasets"
          element={<DatasetsPage />}
            />
        <Route
  path="datasets/upload"
  element={<DatasetUploadPage />}
/>
       <Route
  path="analyses"
  element={<AnalysesPage />}
/>

<Route
  path="analyses/new"
  element={<NewAnalysisPage />}
/>

<Route
  path="analyses/:analysisId"
  element={<AnalysisDetailPage />}
/>

        <Route
          path="settings"
          element={
            <Placeholder
              title="Settings"
            />
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

function Placeholder({ title }) {
  return (
    <div
      style={{
        minHeight: "500px",
        display: "grid",
        placeItems: "center",
        color: "#9999a0",
        fontSize: "13px",
      }}
    >
      {title} — next
    </div>
  );
}

export default Router;