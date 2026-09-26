import { useState } from "react";

import {
  ArrowRight,
  Activity,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "./authService";

import "./auth.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const result = await loginUser(
  email.trim(),
  password
);

sessionStorage.setItem(
  "driftmonitor_user",
  JSON.stringify(result.data)
);

navigate("/app");

      navigate("/app");
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* --------------------------------
          Background
      --------------------------------- */}

      <div
        className="auth-background"
        aria-hidden="true"
      >
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="auth-grid" />
      </div>

      {/* --------------------------------
          Header
      --------------------------------- */}

      <header className="auth-header">
        <Link
          to="/"
          className="auth-brand"
        >
          <span className="auth-brand-symbol">
            <span />
            <span />
            <b />
          </span>

          <span>
            DriftMonitor
          </span>
        </Link>

        <Link
          to="/"
          className="auth-back"
        >
          Back to home
        </Link>
      </header>

      {/* --------------------------------
          Main
      --------------------------------- */}

      <main className="auth-main">

        <section className="auth-intro">

          <div className="auth-intro-label">
            <Activity size={14} />

            MODEL OBSERVABILITY
          </div>

          <h1>
            See what's
            <br />
            changing.
          </h1>

          <p>
            Monitor your models, understand
            distribution shifts, and act before
            drift becomes a problem.
          </p>

          <div className="auth-proof">
            <div className="auth-proof-icon">
              <ShieldCheck size={16} />
            </div>

            <div>
              <strong>
                Evidence-driven monitoring
              </strong>

              <span>
                PSI · KS · χ² · Explainable decisions
              </span>
            </div>
          </div>

        </section>

        {/* --------------------------------
            Login form
        --------------------------------- */}

        <section className="login-panel">

          <div className="login-heading">
            <div className="login-mark">
              <Activity size={17} />
            </div>

            <div>
              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to your workspace.
              </p>
            </div>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            <label className="field">
              <span>
                Email
              </span>

              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label className="field">
              <div className="field-label-row">
                <span>
                  Password
                </span>

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={14} />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      Show
                    </>
                  )}
                </button>
              </div>

              <div className="password-input">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </label>

            {error && (
              <div className="login-error">
                <span className="error-dot" />

                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </span>

              {!loading && (
                <ArrowRight size={16} />
              )}
            </button>

          </form>

          <div className="login-footer">
            <span>
              Secure session-based
              authentication
            </span>

            <span className="login-footer-dot">
              ·
            </span>

            <span>
              DriftMonitor
            </span>
          </div>

        </section>

      </main>

    </div>
  );
}

export default LoginPage;