import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import "./auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    organizationSlug: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStepOne = (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    if (!form.password) {
      setError("Please enter a password.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setStep(2);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        organizationName: form.organizationName.trim(),
        organizationSlug: form.organizationSlug.trim().toLowerCase(),
      });

      sessionStorage.setItem(
        "driftmonitor_user",
        JSON.stringify(response.data)
      );

      navigate("/app");
    } catch (requestError) {
      setError(
        requestError.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background" />

      <header className="auth-header">
       <Link to="/" className="auth-brand">
  <span className="auth-brand-symbol" aria-hidden="true">
    <span />
    <span />
    <b />
  </span>

  <span>DriftMonitor</span>
</Link>

        <Link to="/login" className="auth-back-link">
          <ArrowLeft size={16} />
          Sign in
        </Link>
      </header>

      <section className="auth-content">
        <div className="auth-intro">
          <span className="auth-kicker">
            {step === 1 ? "CREATE YOUR ACCOUNT" : "SET UP YOUR WORKSPACE"}
          </span>

          <h1>
            {step === 1
              ? "Start monitoring with confidence."
              : "Create your monitoring workspace."}
          </h1>

          <p>
            {step === 1
              ? "Create your DriftMonitor account and start building an evidence-driven monitoring workflow."
              : "Your organization is the workspace where models, datasets, analyses, and team members live."}
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div>
              <span className="auth-step-label">
                STEP {step} OF 2
              </span>

              <h2>
                {step === 1
                  ? "Create account"
                  : "Set up organization"}
              </h2>
            </div>

            <span className="auth-step-count">
              {step}/2
            </span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleStepOne} className="auth-form">
              <label className="auth-field">
                <span>Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>

              <label className="auth-field">
                <span>Work email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </label>

              <label className="auth-field">
                <span>Password</span>

                <div className="auth-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>

              <label className="auth-field">
                <span>Confirm password</span>

                <div className="auth-password-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField(
                        "confirmPassword",
                        event.target.value
                      )
                    }
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit">
                Continue
                <ArrowRight size={17} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <label className="auth-field">
                <span>Organization name</span>
                <input
                  type="text"
                  value={form.organizationName}
                  onChange={(event) =>
                    updateField(
                      "organizationName",
                      event.target.value
                    )
                  }
                  placeholder="Your company or organization"
                  autoComplete="organization"
                />
              </label>

              <label className="auth-field">
                <span>Organization slug</span>

                <div className="auth-slug-wrap">
                  <span>driftmonitor.app/</span>

                  <input
                    type="text"
                    value={form.organizationSlug}
                    onChange={(event) =>
                      updateField(
                        "organizationSlug",
                        event.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="your-company"
                  />
                </div>
              </label>

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <div className="auth-form-actions">
                <button
                  type="button"
                  className="auth-secondary-button"
                  onClick={() => {
                    setError("");
                    setStep(1);
                  }}
                  disabled={loading}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create workspace"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}