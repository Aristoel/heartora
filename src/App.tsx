import { useState } from "react";
import {
  Heart,
  MapPin,
  Search,
  Users,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  Globe2,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

type Page = "discover" | "about" | "safety";

export default function App() {
  const [page, setPage] = useState<Page>("discover");
  const [menuOpen, setMenuOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [distance, setDistance] = useState("50");
  const [notice, setNotice] = useState("");

  function discoverMatches() {
    if (!country.trim() || !postalCode.trim()) {
      setNotice("Enter your country and postal or ZIP code to continue.");
      return;
    }

    setNotice(
      "Your location preferences are ready. Account registration and real matching will be connected in a later step."
    );
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMenuOpen(false);
    setNotice("");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigate("discover");
          }}
          aria-label="Heartora home"
        >
          <span className="brand-icon">
            <Heart size={23} fill="currentColor" />
          </span>
          <span>heartora</span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={menuOpen ? "navigation open" : "navigation"}>
          <button
            className={page === "discover" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("discover")}
          >
            Discover
          </button>
          <button
            className={page === "about" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("about")}
          >
            About
          </button>
          <button
            className={page === "safety" ? "nav-link active" : "nav-link"}
            onClick={() => navigate("safety")}
          >
            Safety
          </button>
          <button
            className="header-signin"
            onClick={() =>
              setNotice(
                "Member sign-in will be available when account authentication is implemented."
              )
            }
          >
            Sign in
          </button>
        </nav>
      </header>

      <main>
        {page === "discover" && (
          <>
            <section className="hero">
              <div className="hero-decoration decoration-one" />
              <div className="hero-decoration decoration-two" />

              <div className="hero-content">
                <div className="eyebrow">
                  <Sparkles size={15} />
                  <span>YOUR WORLD. YOUR CONNECTIONS.</span>
                </div>

                <h1>
                  Your next chapter
                  <br />
                  starts with <span>connection.</span>
                </h1>

                <p className="hero-description">
                  Discover new people, build meaningful connections,
                  and find out who you might meet around the world.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      setNotice(
                        "Free registration for adults aged 18 and over will be available when authentication is connected."
                      )
                    }
                  >
                    Join Heartora <ChevronRight size={19} />
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      document
                        .getElementById("discover-form")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore connections
                  </button>
                </div>

                <div className="hero-trust">
                  <span>
                    <ShieldCheck size={17} />
                    Adults 18+ only
                  </span>
                  <span>
                    <Globe2 size={17} />
                    Made for a global community
                  </span>
                </div>
              </div>

              <div className="hero-art" aria-label="Heartora connection artwork">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />

                <div className="floating-heart heart-one">
                  <Heart size={21} fill="currentColor" />
                </div>
                <div className="floating-heart heart-two">
                  <Heart size={16} fill="currentColor" />
                </div>

                <div className="connection-card card-one">
                  <div className="avatar avatar-pink">A</div>
                  <div>
                    <strong>New connections</strong>
                    <span>Start with a hello</span>
                  </div>
                  <Heart className="mini-heart" size={18} />
                </div>

                <div className="main-heart">
                  <Heart
                    size={106}
                    strokeWidth={1.2}
                    fill="currentColor"
                  />
                  <Sparkles className="heart-sparkle" size={27} />
                </div>

                <div className="connection-card card-two">
                  <div className="avatar avatar-purple">H</div>
                  <div>
                    <strong>Closer, wherever</strong>
                    <span>Your world, connected</span>
                  </div>
                  <MessageCircle className="mini-message" size={19} />
                </div>
              </div>
            </section>

            <section className="benefits">
              <div className="section-heading">
                <span className="section-kicker">A WORLD OF POSSIBILITY</span>
                <h2>Connection has no borders.</h2>
                <p>
                  A welcoming place to meet people and discover
                  meaningful possibilities.
                </p>
              </div>

              <div className="benefit-grid">
                <article className="benefit-card">
                  <div className="benefit-icon pink-icon">
                    <Heart size={24} />
                  </div>
                  <h3>Meaningful connections</h3>
                  <p>
                    Make space for genuine conversations,
                    friendships, and relationships.
                  </p>
                </article>

                <article className="benefit-card">
                  <div className="benefit-icon purple-icon">
                    <Globe2 size={24} />
                  </div>
                  <h3>A worldwide community</h3>
                  <p>
                    Discover the possibilities of meeting people
                    across cities and countries.
                  </p>
                </article>

                <article className="benefit-card">
                  <div className="benefit-icon peach-icon">
                    <ShieldCheck size={24} />
                  </div>
                  <h3>Safety comes first</h3>
                  <p>
                    Build a community with clear boundaries,
                    privacy protections, and safety tools.
                  </p>
                </article>
              </div>
            </section>

            <section className="discover-section" id="discover-form">
              <div className="discover-copy">
                <span className="section-kicker">START CLOSE OR GO GLOBAL</span>
                <h2>Someone new could be just around the world.</h2>
                <p>
                  Choose a location and preferred distance to
                  prepare your discovery preferences.
                </p>

                <div className="location-points">
                  <span>
                    <MapPin size={18} />
                    Start with your location
                  </span>
                  <span>
                    <Globe2 size={18} />
                    Choose your discovery distance
                  </span>
                  <span>
                    <Users size={18} />
                    Meet people on your terms
                  </span>
                </div>
              </div>

              <form
                className="location-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  discoverMatches();
                }}
              >
                <div className="form-heading">
                  <div className="form-heading-icon">
                    <Search size={21} />
                  </div>
                  <div>
                    <h3>Explore your world</h3>
                    <p>Set your discovery preferences</p>
                  </div>
                </div>

                <label htmlFor="country">Country or region</label>
                <input
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  placeholder="Enter your country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />

                <label htmlFor="postal-code">ZIP or postal code</label>
                <input
                  id="postal-code"
                  name="postal-code"
                  autoComplete="postal-code"
                  placeholder="Enter your postal code"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                />

                <label htmlFor="distance">Preferred distance</label>
                <select
                  id="distance"
                  value={distance}
                  onChange={(event) => setDistance(event.target.value)}
                >
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                  <option value="100">Within 100 miles</option>
                  <option value="250">Within 250 miles</option>
                  <option value="worldwide">Worldwide</option>
                </select>

                <button className="primary-button form-submit" type="submit">
                  Set my preferences <ChevronRight size={19} />
                </button>

                {notice && (
                  <p className="form-notice" role="status">
                    {notice}
                  </p>
                )}

                <p className="privacy-note">
                  <ShieldCheck size={15} />
                  Your location preferences are not sent to a server yet.
                </p>
              </form>
            </section>

            <section className="closing-section">
              <div className="closing-heart">
                <Heart size={27} fill="currentColor" />
              </div>
              <h2>Every great connection begins somewhere.</h2>
              <p>
                Make room for new conversations, new friendships,
                and new possibilities.
              </p>
              <button
                className="primary-button"
                onClick={() =>
                  setNotice(
                    "Heartora registration will be connected in a later step."
                  )
                }
              >
                Your story starts here <ChevronRight size={19} />
              </button>
              {notice && (
                <p className="closing-notice" role="status">
                  {notice}
                </p>
              )}
            </section>
          </>
        )}

        {page === "about" && (
          <section className="information-page">
            <span className="section-kicker">ABOUT HEARTORA</span>
            <h1>Bringing people closer, everywhere.</h1>
            <p>
              Heartora is being designed as a worldwide dating and
              social community for adults aged 18 and over.
              Our goal is to make discovering people and building
              meaningful connections feel welcoming and accessible.
            </p>
            <p>
              The planned experience includes free registration,
              optional premium features, location-based discovery,
              and tools to help members manage their privacy.
            </p>
            <button
              className="primary-button"
              onClick={() => navigate("discover")}
            >
              Back to discover <ChevronRight size={19} />
            </button>
          </section>
        )}

        {page === "safety" && (
          <section className="information-page">
            <span className="section-kicker">SAFETY & PRIVACY</span>
            <h1>Your boundaries matter.</h1>
            <p>
              Heartora is intended for adults aged 18 and over.
              Privacy, respectful behavior, and member safety
              will be essential parts of the platform.
            </p>
            <div className="safety-list">
              <div>
                <ShieldCheck size={23} />
                <span>
                  <strong>Account protection</strong>
                  <small>
                    Secure sign-in and account recovery are planned.
                  </small>
                </span>
              </div>
              <div>
                <MapPin size={23} />
                <span>
                  <strong>Location privacy</strong>
                  <small>
                    Exact home addresses should never appear on
                    public member profiles.
                  </small>
                </span>
              </div>
              <div>
                <Users size={23} />
                <span>
                  <strong>Community standards</strong>
                  <small>
                    Reporting, blocking, and moderation tools
                    are planned for the platform.
                  </small>
                </span>
              </div>
            </div>
            <button
              className="primary-button"
              onClick={() => navigate("discover")}
            >
              Back to discover <ChevronRight size={19} />
            </button>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <a
          className="footer-brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            navigate("discover");
          }}
        >
          <Heart size={19} fill="currentColor" />
          heartora
        </a>
        <p>Made for meaningful connections around the world.</p>
        <div className="footer-links">
          <button onClick={() => navigate("about")}>About</button>
          <button onClick={() => navigate("safety")}>Safety & privacy</button>
        </div>
        <small>© {new Date().getFullYear()} Heartora. Adults 18+ only.</small>
      </footer>
    </div>
  );
    }
    
