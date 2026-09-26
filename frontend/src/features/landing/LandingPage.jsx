import {
  ArrowRight,
  Activity,
  ShieldCheck,
} from "lucide-react";

import { Link } from "react-router-dom";

import Navbar from "./Navbar";
import ParticleField from "./ParticleField";

import "./landing.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />

      <main>
        {/* ----------------------------------------
            HERO
        ----------------------------------------- */}

        <section className="hero-section">
          <ParticleField />

          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-mark">
                <Activity size={13} />
              </span>

              Intelligent model observability
            </div>

            <h1 className="hero-title">
              Know when your
              <br />
              models start drifting.
            </h1>

            <p className="hero-description">
              Monitor production ML models with
              statistical evidence you can actually
              trust.
            </p>

            <div className="hero-actions">
              <Link
                to="/login"
                className="primary-cta"
              >
                Start monitoring
                <ArrowRight size={17} />
              </Link>

              <a
                href="#product"
                className="secondary-cta"
              >
                Explore DriftMonitor
              </a>
            </div>

            <div className="hero-trust">
              <ShieldCheck size={14} />

              Statistical drift detection
              · Explainable decisions
              · Model-level health
            </div>
          </div>

          <div className="hero-scroll">
            <span />
            Scroll to explore
          </div>
        </section>

        {/* ----------------------------------------
            STATEMENT
        ----------------------------------------- */}

        <section
          id="product"
          className="statement-section"
        >
          <div className="section-kicker">
            THE PROBLEM
          </div>

          <h2>
            Your model doesn't suddenly
            <br />
            become wrong.
            <br />
            <span>Its data changes first.</span>
          </h2>

          <p>
            DriftMonitor detects those changes,
            measures their significance, and turns
            statistical evidence into decisions you
            can act on.
          </p>
        </section>

        {/* ----------------------------------------
            ENGINE
        ----------------------------------------- */}

        <section id="engine" className="engine-section">
          <div className="engine-copy">
            <div className="section-kicker">
              UNDER THE HOOD
            </div>

            <h2>
              Three statistical signals.
              <br />
              One clear decision.
            </h2>

            <p>
              DriftMonitor combines multiple
              statistical tests instead of relying
              on a single threshold.
            </p>
          </div>

          <div className="engine-flow">
            <div className="engine-node">
              <span>01</span>
              <strong>PSI</strong>
              <small>
                Distribution stability
              </small>
            </div>

            <div className="engine-line" />

            <div className="engine-node">
              <span>02</span>
              <strong>KS</strong>
              <small>
                Distribution difference
              </small>
            </div>

            <div className="engine-line" />

            <div className="engine-node">
              <span>03</span>
              <strong>χ²</strong>
              <small>
                Categorical evidence
              </small>
            </div>

            <div className="engine-line" />

            <div className="engine-node engine-node-result">
              <span>04</span>
              <strong>Health</strong>
              <small>
                Model-level decision
              </small>
            </div>
          </div>
        </section>

        {/* ----------------------------------------
    HOW IT WORKS
----------------------------------------- */}

<section
  id="how-it-works"
  className="how-it-works-section"
>
  <div className="section-kicker">
    HOW IT WORKS
  </div>

  <div className="how-it-works-header">
    <h2>
      From changing data
      <br />
      to a clear decision.
    </h2>

    <p>
      DriftMonitor compares a trusted baseline
      against current production data, evaluates
      statistical evidence, and turns the result
      into an actionable monitoring decision.
    </p>
  </div>

  <div className="how-it-works-flow">
    <div className="workflow-step">
      <span>01</span>
      <strong>Baseline</strong>
      <p>
        Establish the reference distribution
        your model expects.
      </p>
    </div>

    <div className="workflow-step">
      <span>02</span>
      <strong>Current data</strong>
      <p>
        Upload the latest production
        observation for comparison.
      </p>
    </div>

    <div className="workflow-step">
      <span>03</span>
      <strong>Detect drift</strong>
      <p>
        Evaluate numerical and categorical
        features using statistical tests.
      </p>
    </div>

    <div className="workflow-step">
      <span>04</span>
      <strong>Make a decision</strong>
      <p>
        Combine feature evidence into an
        overall model health decision.
      </p>
    </div>
  </div>
</section>


{/* ----------------------------------------
    MONITORING
----------------------------------------- */}

<section
  id="monitoring"
  className="monitoring-section"
>
  <div className="section-kicker">
    WHAT YOU SEE
  </div>

  <div className="monitoring-header">
    <h2>
      Evidence at the feature level.
      <br />
      Clarity at the model level.
    </h2>
  </div>

  <div className="monitoring-grid">
    <div className="monitoring-item">
      <span>01</span>

      <h3>Feature evidence</h3>

      <p>
        See which features changed, how strongly
        they changed, and what statistical evidence
        supports the finding.
      </p>
    </div>

    <div className="monitoring-item">
      <span>02</span>

      <h3>Model health</h3>

      <p>
        Understand the combined effect of detected
        drift through a single model-level health
        assessment.
      </p>
    </div>

    <div className="monitoring-item">
      <span>03</span>

      <h3>Actionable recommendations</h3>

      <p>
        Move from statistical results to practical
        next steps such as investigation, validation,
        or monitoring.
      </p>
    </div>
  </div>
</section>

        {/* ----------------------------------------
            FINAL CTA
        ----------------------------------------- */}

        <section id="get-started" className="final-cta-section">
          <div className="final-cta-glow" />

          <div className="section-kicker">
            DRIFTMONITOR
          </div>

          <h2>
            See the shift.
            <br />
            Understand the risk.
          </h2>

          <Link
            to="/login"
            className="primary-cta"
          >
            Get started
            <ArrowRight size={17} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© 2026 DriftMonitor</span>

        <span>
          Intelligent ML observability
        </span>
      </footer>
    </div>
  );
}

export default LandingPage;