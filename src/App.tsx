import { useState } from "react";
import type { FormEvent } from "react";
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
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  CalendarDays,
} from "lucide-react";

type Page =
  | "discover"
  | "about"
  | "safety"
  | "signup"
  | "signin"
  | "forgot";

type Notice = {
  type: "success" | "error" | "info";
  message: string;
};

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Nigeria",
  "South Africa",
  "Philippines",
  "Germany",
  "France",
  "Brazil",
  "Mexico",
  "Japan",
  "New Zealand",
  "Other",
];

export default function App() {
  const [page, setPage] = useState<Page>("discover");
  const [menuOpen, setMenuOpen] = useState(false);

  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("96013");
  const [distance, setDistance] = useState("50");
  const [locationNotice, setLocationNotice] = useState("");

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [authNotice, setAuthNotice] = useState<Notice | null>(null);

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMenuOpen(false);
    setLocationNotice("");
    setAuthNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function discoverMatches() {
    if (!country.trim() || !postalCode.trim()) {
      setLocationNotice(
        "Please enter your country and ZIP or postal code."
      );
      return;
    }

    setLocationNotice(
      "Your preferences have been prepared on this device. Member matching is not connected yet."
    );
  }

  function calculateAge(dateString: string) {
    if (!dateString) return 0;

    const birth = new Date(`${dateString}T00:00:00`);
    const today = new Date();

    if (Number.isNaN(birth.getTime()) || birth > today) {
      return 0;
    }

    let age = today.getFullYear() - birth.getFullYear();

    const monthDifference = today.getMonth() - birth.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthNotice(null);

    if (!fullName.trim() || !displayName.trim()) {
      setAuthNotice({
        type: "error",
        message: "Enter your name and the display name you want to use.",
      });
      return;
    }

    if (calculateAge(birthDate) < 18) {
      setAuthNotice({
        type: "error",
        message:
          "Heartora is for adults aged 18 and over. You must be at least 18 to register.",
      });
      return;
    }

    if (password.length < 8) {
      setAuthNotice({
        type: "error",
        message: "Your password must contain at least 8 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setAuthNotice({
        type: "error",
        message: "Your passwords do not match. Please try again.",
      });
      return;
    }

    if (!acceptedAge || !acceptedTerms) {
      setAuthNotice({
        type: "error",
        message:
          "Confirm that you are 18 or older and accept the Terms and Privacy Policy.",
      });
      return;
    }

    setAuthNotice({
      type: "info",
      message:
        "Your information passed the initial checks. Account creation is not connected yet, so no account has been created and your details have not been sent to a server.",
    });
  }

  function handleSignin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAuthNotice({
      type: "info",
      message:
        "The sign-in form is ready, but secure account authentication has not been connected yet. You cannot sign in until the backend is implemented.",
    });
  }

  function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAuthNotice({
      type: "info",
      message:
        "Password recovery is not connected yet. No recovery email has been sent.",
    });
  }

  function renderBrand() {
    return (
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
    );
  }

  function renderAuthNotice() {
    if (!authNotice) return null;

    return (
      <div
        className="form-notice"
        role="status"
        aria-live="polite"
        style={{
          marginTop: 20,
          color:
            authNotice.type === "error"
              ? "#a32243"
              : authNotice.type === "success"
                ? "#246b4b"
                : "#8c2850",
          background:
            authNotice.type === "error"
              ? "#fff0f1"
              : authNotice.type === "success"
                ? "#edfaf2"
                : "#fff0f5",
        }}
      >
        {authNotice.message}
      </div>
    );
  }

  function renderPasswordField(
    id: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    autoComplete: string
  ) {
    return (
      <>
        <label htmlFor={id}>{label}</label>
        <div className="auth-password-wrap">
          <LockKeyhole size={19} aria-hidden="true" />
          <input
            id={id}
            name={id}
            type={showPassword ? "text" : "password"}
            autoComplete={autoComplete}
            minLength={8}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="At least 8 characters"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        </div>
      </>
    );
  }

  function renderAuthPage() {
    const isSignup = page === "signup";
    const isForgot = page === "forgot";

    const heading = isSignup
      ? "Create your Heartora account"
      : isForgot
        ? "Reset your password"
        : "Welcome back";

    const description = isSignup
      ? "Join a worldwide community of adults looking for meaningful connections."
      : isForgot
        ? "Enter your email address to begin account recovery."
        : "Sign in to continue your Heartora journey.";

    return (
      <section className="information-page auth-page">
        <button
          className="secondary-button auth-back"
          type="button"
          onClick={() => navigate("discover")}
        >
          <ArrowLeft size={18} />
          Back to Heartora
        </button>

        <div className="auth-panel">
          <div className="auth-logo">
            <span className="brand-icon">
              <Heart size={25} fill="currentColor" />
            </span>
          </div>

          <span className="section-kicker">
            {isSignup
              ? "YOUR STORY STARTS HERE"
              : isForgot
                ? "ACCOUNT RECOVERY"
                : "WELCOME BACK"}
          </span>

          <h1>{heading}</h1>
          <p className="auth-description">{description}</p>

          <form
            className="location-form auth-form"
            onSubmit={
              isSignup
                ? handleSignup
                : isForgot
                  ? handleForgotPassword
                  : handleSignin
            }
          >
            {isSignup && (
              <>
                <label htmlFor="full-name">Full name</label>
                <div className="auth-input-wrap">
                  <UserRound size={19} aria-hidden="true" />
                  <input
                    id="full-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    maxLength={100}
                    required
                  />
                </div>

                <label htmlFor="display-name">Display name</label>
                <div className="auth-input-wrap">
                  <Heart size={19} aria-hidden="true" />
                  <input
                    id="display-name"
                    name="displayName"
                    type="text"
                    autoComplete="nickname"
                    placeholder="How members will see you"
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(event.target.value)
                    }
                    maxLength={40}
                    required
                  />
                </div>

                <label htmlFor="birth-date">Date of birth</label>
                <div className="auth-input-wrap">
                  <CalendarDays size={19} aria-hidden="true" />
                  <input
                    id="birth-date"
                    name="birthDate"
                    type="date"
                    autoComplete="bday"
                    max={new Date().toISOString().slice(0, 10)}
                    value={birthDate}
                    onChange={(event) =>
                      setBirthDate(event.target.value)
                    }
                    required
                  />
                </div>
              </>
            )}

            <label htmlFor="auth-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={19} aria-hidden="true" />
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </div>

            {isSignup && (
              <>
                <label htmlFor="signup-country">Country</label>
                <select
                  id="signup-country"
                  name="country"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  required
                >
                  <option value="">Select your country</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <label htmlFor="signup-postal">ZIP or postal code</label>
                <div className="auth-input-wrap">
                  <MapPin size={19} aria-hidden="true" />
                  <input
                    id="signup-postal"
                    name="postalCode"
                    type="text"
                    autoComplete="postal-code"
                    placeholder="Your postal code"
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(event.target.value)
                    }
                    maxLength={20}
                    required
                  />
                </div>
              </>
            )}

            {!isForgot &&
              renderPasswordField(
                isSignup ? "signup-password" : "signin-password",
                "Password",
                password,
                setPassword,
                isSignup ? "new-password" : "current-password"
              )}

            {isSignup && (
              <>
                {renderPasswordField(
                  "confirm-password",
                  "Confirm password",
                  confirmPassword,
                  setConfirmPassword,
                  "new-password"
                )}

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={acceptedAge}
                    onChange={(event) =>
                      setAcceptedAge(event.target.checked)
                    }
                    required
                  />
                  <span>
                    I confirm that I am at least 18 years old.
                  </span>
                </label>

                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) =>
                      setAcceptedTerms(event.target.checked)
                    }
                    required
                  />
                  <span>
                    I agree to the Terms of Service and Privacy Policy.
                  </span>
                </label>
              </>
            )}

            <button
              className="primary-button form-submit"
              type="submit"
            >
              {isSignup
                ? "Create account"
                : isForgot
                  ? "Request password reset"
                  : "Sign in"}
              <ChevronRight size={19} />
            </button>

            {renderAuthNotice()}
          </form>

          <div className="auth-switch">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("signin")}
                >
                  Sign in
                </button>
              </>
            ) : isForgot ? (
              <>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => navigate("signin")}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Heartora?{" "}
                <button
                  type="button"
                  onClick={() => navigate("signup")}
                >
                  Create an account
                </button>
                <br />
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => navigate("forgot")}
                >
                  Forgot your password?
                </button>
              </>
            )}
          </div>

          <p className="privacy-note">
            <ShieldCheck size={17} />
            Heartora is intended for adults aged 18 and over. Never
            share your password with anyone.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        {renderBrand()}

        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          className={menuOpen ? "navigation open" : "navigation"}
          aria-label="Main navigation"
        >
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
            onClick={() => navigate("signin")}
          >
            Sign in
          </button>

          <button
            className="primary-button"
            onClick={() => navigate("signup")}
          >
            Join free <ChevronRight size={17} />
          </button>
        </nav>
      </header>

      <main>
        {(page === "signup" ||
          page === "signin" ||
          page === "forgot") &&
          renderAuthPage()}

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
                    onClick={() => navigate("signup")}
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
                    Make space for genuine conversations, friendships,
                    and relationships.
                  </p>
                </article>

                <article className="benefit-card">
                  <div className="benefit-icon purple-icon">
                    <Globe2 size={24} />
                  </div>
                  <h3>A worldwide community</h3>
                  <p>
                    Discover the possibilities of meeting people across
                    cities and countries.
                  </p>
                </article>

                <article className="benefit-card">
                  <div className="benefit-icon peach-icon">
                    <ShieldCheck size={24} />
                  </div>
                  <h3>Safety comes first</h3>
                  <p>
                    Build a community with clear boundaries, privacy
                    protections, and safety tools.
                  </p>
                </article>
              </div>
            </section>

            <section className="discover-section" id="discover-form">
              <div className="discover-copy">
                <span className="section-kicker">START CLOSE OR GO GLOBAL</span>
                <h2>Someone new could be just around the world.</h2>
                <p>
                  Choose a location and preferred distance to prepare
                  your discovery preferences.
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
                <select
                  id="country"
                  name="country"
                  autoComplete="country-name"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  required
                >
                  <option value="">Select your country</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <label htmlFor="postal-code">ZIP or postal code</label>
                <input
                  id="postal-code"
                  name="postal-code"
                  autoComplete="postal-code"
                  placeholder="Enter your postal code"
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  maxLength={20}
                  required
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

                {locationNotice && (
                  <p className="form-notice" role="status">
                    {locationNotice}
                  </p>
                )}

                <p className="privacy-note">
                  <ShieldCheck size={15} />
                  Your location preferences are stored only in this page
                  for now and are not sent to a server.
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
                onClick={() => navigate("signup")}
              >
                Your story starts here <ChevronRight size={19} />
              </button>
            </section>
          </>
        )}

        {page === "about" && (
          <section className="information-page">
            <span className="section-kicker">ABOUT HEARTORA</span>
            <h1>Bringing people closer, everywhere.</h1>
            <p>
              Heartora is being designed as a worldwide dating and social
              community for adults aged 18 and over.
            </p>
            <p>
              The planned experience includes free registration,
              optional premium features, location-based discovery,
              and tools to help members manage their privacy.
            </p>
            <button
              className="primary-button"
              onClick={() => navigate("signup")}
            >
              Join Heartora <ChevronRight size={19} />
            </button>
          </section>
        )}

        {page === "safety" && (
          <section className="information-page">
            <span className="section-kicker">SAFETY & PRIVACY</span>
            <h1>Your boundaries matter.</h1>
            <p>
              Heartora is intended for adults aged 18 and over.
              Privacy, respectful behavior, and member safety are
              essential parts of the platform.
            </p>

            <div className="safety-list">
              <div>
                <ShieldCheck size={23} />
                <span>
                  <strong>Account protection</strong>
                  <small>
                    Secure sign-in and account recovery must be
                    connected before accounts can be used.
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
                    Reporting, blocking, and moderation tools are
                    planned for the platform.
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
          <button onClick={() => navigate("safety")}>
            Safety & privacy
          </button>
          <button onClick={() => navigate("signup")}>Join Heartora</button>
          <button onClick={() => navigate("signin")}>Sign in</button>
        </div>

        <small>
          © {new Date().getFullYear()} Heartora. Adults 18+ only.
        </small>
      </footer>
    </div>
  );
  }
