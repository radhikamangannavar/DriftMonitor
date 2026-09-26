import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import "./workspace.css";

function WorkspaceLayout() {
  const navigate = useNavigate();

  const user = JSON.parse(
    sessionStorage.getItem("driftmonitor_user") || "null"
  );

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5001/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Client-side cleanup still happens.
    }

    sessionStorage.removeItem("driftmonitor_user");

    navigate("/login");
  };

  return (
    <div className="workspace">

      {/* ==================================================
          APP NAVBAR
      ================================================== */}

      <header className="app-navbar">

        <NavLink
          to="/app"
          className="app-brand"
        >
          <span className="app-brand-mark">
            <span />
            <span />
            <b />
          </span>

          <span>DriftMonitor</span>
        </NavLink>


        <nav className="app-main-nav">

          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `app-nav-link ${isActive ? "active" : ""}`
            }
          >
            Overview
          </NavLink>

          <NavLink
            to="/app/models"
            className={({ isActive }) =>
              `app-nav-link ${isActive ? "active" : ""}`
            }
          >
            Models
          </NavLink>

          <NavLink
            to="/app/datasets"
            className={({ isActive }) =>
              `app-nav-link ${isActive ? "active" : ""}`
            }
          >
            Datasets
          </NavLink>

          <NavLink
            to="/app/analyses"
            className={({ isActive }) =>
              `app-nav-link ${isActive ? "active" : ""}`
            }
          >
            Analyses
          </NavLink>

        </nav>


        {/* ==================================================
            USER
        ================================================== */}

        <div className="app-user-area">

          <div className="app-user">

            <div className="app-avatar">
              {initials}
            </div>

            <div className="app-user-text">
              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.role || "viewer"}
              </span>
            </div>

          </div>

          <button
            type="button"
            className="app-logout"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>

        </div>

      </header>


      {/* ==================================================
          PAGE
      ================================================== */}

      <main className="app-content">
        <Outlet />
      </main>

    </div>
  );
}

export default WorkspaceLayout;