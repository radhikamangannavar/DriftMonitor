import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const menuItems = {
  Product: [
    {
      label: "Overview",
      description: "See what DriftMonitor does.",
      href: "#product",
    },
    {
      label: "Drift detection",
      description: "Detect meaningful changes in production data.",
      href: "#engine",
    },
    {
      label: "Decision engine",
      description: "Turn statistical evidence into clear decisions.",
      href: "#engine",
    },
  ],

  Monitoring: [
    {
      label: "Data drift",
      description: "Track changes from baseline to current data.",
      href: "#monitoring",
    },
    {
      label: "Statistical signals",
      description: "Combine PSI, KS and χ² evidence.",
      href: "#engine",
    },
    {
      label: "Model health",
      description: "Understand the health of monitored models.",
      href: "#monitoring",
    },
  ],

  Solutions: [
    {
      label: "Production ML",
      description: "Monitor the data your deployed models depend on.",
      href: "#how-it-works",
    },
    {
      label: "Data teams",
      description: "Investigate changes with measurable evidence.",
      href: "#monitoring",
    },
    {
      label: "Model monitoring",
      description: "Move from drift detection to clear decisions.",
      href: "#how-it-works",
    },
  ],

  Resources: [
    {
      label: "How it works",
      description: "See how DriftMonitor evaluates drift.",
      href: "#how-it-works",
    },
    {
      label: "Get started",
      description: "Start monitoring your model data.",
      href: "#get-started",
    },
  ],
};

function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const toggleMenu = (menu) => {
    setOpenMenu((current) =>
      current === menu ? null : menu
    );
  };

  return (
    <header className="landing-navbar">
      <Link
        to="/"
        className="landing-brand"
        onClick={() => setOpenMenu(null)}
      >
        <span className="brand-symbol">
          <span className="brand-symbol-core" />
        </span>

        <span>DriftMonitor</span>
      </Link>

      <nav
        ref={navRef}
        className="landing-nav"
        aria-label="Main navigation"
      >
        {Object.entries(menuItems).map(
          ([menu, items]) => (
            <div
              key={menu}
              className={`nav-dropdown-wrapper ${
                openMenu === menu ? "is-open" : ""
              }`}
            >
              <button
                type="button"
                className="nav-dropdown"
                onClick={() => toggleMenu(menu)}
                aria-expanded={openMenu === menu}
              >
                {menu}

                <ChevronDown
                  size={14}
                  className="nav-dropdown-icon"
                />
              </button>

              {openMenu === menu && (
                <div className="nav-dropdown-menu">
                  {items.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="nav-dropdown-item"
                      onClick={() => setOpenMenu(null)}
                    >
                      <span>
                        <strong>{item.label}</strong>

                        <small>
                          {item.description}
                        </small>
                      </span>

                      <ArrowUpRight size={14} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </nav>

      <div className="landing-nav-actions">
        <Link
          to="/login"
          className="signin-link"
        >
          Sign in
        </Link>

        <Link
          to="/login"
          className="nav-cta"
        >
          Get started
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}

export default Navbar;