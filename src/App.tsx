import { useEffect, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
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
  LogOut,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

type Page =
  | "discover"
  | "about"
  | "safety"
  | "signup"
  | "signin"
  | "forgot"
  | "premium";

type Notice = {
  type: "success" | "error" | "info";
  message: string;
};

type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  country: string;
};

type AuthResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  user?: AuthUser;
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

const styles: Record<string, CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#fffafc",
    color: "#261c2b",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(255,250,252,0.96)",
    backdropFilter: "blur(14px)",
    borderBottom: "1px solid #f0e5ec",
  },
  headerInner: {
    maxWidth: 1180,
    minHeight: 76,
    margin: "0 auto",
    padding: "12px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "nowrap",
  },
    
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    border: 0,
    background: "transparent",
    cursor: "pointer",
    color: "#7d2459",
    fontSize: 25,
    fontWeight: 850,
    letterSpacing: "-1px",
    padding: 0,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    flexWrap: "wrap",
  },
  navButton: {
    border: 0,
    background: "transparent",
    color: "#625565",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 650,
    cursor: "pointer",
  },
  primaryButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    background: "linear-gradient(135deg,#a62e70,#75275d)",
    color: "#fff",
    border: 0,
    borderRadius: 14,
    padding: "13px 19px",
    fontSize: 14,
    fontWeight: 750,
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(125,36,89,.17)",
  },
  secondaryButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    color: "#7d2459",
    border: "1px solid #ead5e2",
    borderRadius: 14,
    padding: "12px 18px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  main: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "38px 22px 72px",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 30,
    padding: "clamp(30px,6vw,78px)",
    background:
      "radial-gradient(circle at 85% 20%,#f5cfe3 0,transparent 33%),linear-gradient(135deg,#fff0f6,#f8eafa 55%,#f5e7f5)",
    border: "1px solid #f2ddeb",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    background: "#fff",
    color: "#8a2d64",
    padding: "8px 12px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: ".4px",
    border: "1px solid #f0d9e7",
  },
  heroTitle: {
    maxWidth: 730,
    fontSize: "clamp(38px,7vw,72px)",
    lineHeight: 1.06,
    letterSpacing: "-2.8px",
    margin: "24px 0 18px",
    color: "#382038",
  },
  accent: {
    color: "#a62e70",
  },
  paragraph: {
    color: "#6f5d70",
    fontSize: 16,
    lineHeight: 1.8,
    maxWidth: 650,
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 25,
  },
  section: {
    marginTop: 65,
  },
  sectionTitle: {
    fontSize: "clamp(27px,4vw,39px)",
    letterSpacing: "-1.2px",
    margin: "0 0 12px",
    color: "#382038",
  },
  sectionText: {
    color: "#776678",
    fontSize: 15,
    lineHeight: 1.8,
    maxWidth: 720,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))",
    gap: 18,
    marginTop: 25,
  },
  card: {
    background: "#fff",
    border: "1px solid #f0e4ec",
    borderRadius: 21,
    padding: 25,
    boxShadow: "0 8px 30px rgba(65,30,57,.035)",
  },
  iconBox: {
    width: 47,
    height: 47,
    borderRadius: 15,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#922c68",
    background: "#fae9f3",
    marginBottom: 17,
  },
  muted: {
    color: "#79697b",
    fontSize: 14,
    lineHeight: 1.75,
  },
  panel: {
    maxWidth: 570,
    margin: "12px auto 0",
    background: "#fff",
    border: "1px solid #f0e2eb",
    borderRadius: 25,
    padding: "clamp(22px,5vw,40px)",
    boxShadow: "0 15px 50px rgba(65,30,57,.055)",
  },
  inputGroup: {
    marginTop: 17,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 750,
    color: "#49354c",
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    color: "#9a8297",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "13px 14px 13px 43px",
    borderRadius: 12,
    border: "1px solid #e9dce6",
    background: "#fff",
    color: "#352638",
    fontSize: 15,
    outlineColor: "#a62e70",
  },
  plainInput: {
    width: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid #e9dce6",
    background: "#fff",
    color: "#352638",
    fontSize: 15,
    outlineColor: "#a62e70",
  },
  select: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid #e9dce6",
    background: "#fff",
    color: "#352638",
    fontSize: 15,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
    gap: 14,
  },
  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    color: "#6c5a6e",
    fontSize: 13,
    lineHeight: 1.7,
    marginTop: 16,
  },
  notice: {
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    lineHeight: 1.6,
    marginTop: 18,
  },
  footer: {
    borderTop: "1px solid #f0e5ec",
    background: "#fff",
    padding: "28px 22px",
  },
  footerInner: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    flexWrap: "wrap",
  },
};

async function authRequest(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
): Promise<AuthResponse> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const result = (await response.json().catch(() => null)) as
    | AuthResponse
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        "Something went wrong. Please try again in a moment.",
    );
  }

  return result;
}

function calculateAge(dateString: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return -1;

  const birth = new Date(`${dateString}T00:00:00.000Z`);

  if (
    Number.isNaN(birth.getTime()) ||
    birth.toISOString().slice(0, 10) !== dateString
  ) {
    return -1;
  }

  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();

  if (
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() &&
      today.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

export default function App() {
  const [page, setPage] = useState<Page>("discover");
  const [menuOpen, setMenuOpen] = useState(false);

  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("");
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let active = true;

    authRequest("/api/auth/me", "GET")
      .then((result) => {
        if (active && result.user) {
          setCurrentUser(result.user);
        }
      })
      .catch(() => {
        // A visitor without an active session can still browse Heartora.
      });

    return () => {
      active = false;
    };
  }, []);

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMenuOpen(false);
    setAuthNotice(null);
    setLocationNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function discoverMatches(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!country.trim() || !postalCode.trim()) {
      setLocationNotice(
        "Please select your country and enter your postal or ZIP code.",
      );
      return;
    }

    setLocationNotice(
      `Your discovery preferences are set to ${country}, ${postalCode.trim()}, within ${distance} miles. Matching results are not available yet.`,
    );
  }

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthNotice(null);

    if (
      !fullName.trim() ||
      !displayName.trim() ||
      !email.trim() ||
      !birthDate ||
      !country ||
      !postalCode.trim()
    ) {
      setAuthNotice({
        type: "error",
        message: "Please complete all required fields.",
      });
      return;
    }

    if (calculateAge(birthDate) < 18) {
      setAuthNotice({
        type: "error",
        message: "Heartora is only available to adults aged 18 and over.",
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
        message: "Your passwords do not match.",
      });
      return;
    }

    if (!acceptedAge || !acceptedTerms) {
      setAuthNotice({
        type: "error",
        message:
          "Please confirm that you are 18 or older and accept the terms.",
      });
      return;
    }

    setAuthLoading(true);

    try {
      const result = await authRequest("/api/auth/signup", "POST", {
        fullName: fullName.trim(),
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        birthDate,
        country,
        postalCode: postalCode.trim(),
      });

      if (result.user) {
        setCurrentUser(result.user);
      }

      setPassword("");
      setConfirmPassword("");

      setAuthNotice({
        type: "success",
        message:
          result.message ||
          "Your account has been created and you are signed in.",
      });
    } catch (error) {
      setAuthNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't create your account. Please try again.",
      });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthNotice(null);

    if (!email.trim() || !password) {
      setAuthNotice({
        type: "error",
        message: "Please enter your email address and password.",
      });
      return;
    }

    setAuthLoading(true);

    try {
      const result = await authRequest("/api/auth/signin", "POST", {
        email: email.trim(),
        password,
      });

      if (result.user) {
  setCurrentUser(result.user);
}

setPassword("");
setConfirmPassword("");

navigate("discover");
        
    } catch (error) {
      setAuthNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign in. Please try again.",
      });
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignout() {
    setAuthLoading(true);

    try {
      await authRequest("/api/auth/signout", "POST");

      setCurrentUser(null);
      setPassword("");
      setConfirmPassword("");
      navigate("signin");

      setAuthNotice({
        type: "success",
        message: "You have signed out successfully.",
      });
    } catch (error) {
      setAuthNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign out. Please try again.",
      });
    } finally {
      setAuthLoading(false);
    }
  }

  function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAuthNotice({
      type: "info",
      message:
        "Password recovery is not available yet. No recovery email has been sent. Please return to sign in.",
    });
  }

  function renderBrand() {
    return (
      <button
        type="button"
        style={styles.brand}
        onClick={() => navigate("discover")}
        aria-label="Heartora home"
      >
        <Heart size={27} fill="currentColor" />
        <span>Heartora</span>
      </button>
    );
  }

  function renderAuthNotice() {
    if (!authNotice) return null;

    const colors =
      authNotice.type === "success"
        ? { background: "#eaf8ef", color: "#236a3b", border: "#c7ead2" }
        : authNotice.type === "error"
          ? { background: "#fff0f0", color: "#a42b3b", border: "#f3cccc" }
          : { background: "#f0f4ff", color: "#38558c", border: "#d7e1fb" };

    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          ...styles.notice,
          ...colors,
          border: `1px solid ${colors.border}`,
        }}
      >
        {authNotice.message}
      </div>
    );
  }

  function renderPasswordField(
    label: string,
    value: string,
    setValue: (value: string) => void,
    id: string,
    autocomplete: string,
  ) {
    return (
      <div style={styles.inputGroup}>
        <label htmlFor={id} style={styles.label}>
          {label}
        </label>

        <div style={styles.inputWrap}>
          <LockKeyhole size={17} style={styles.inputIcon} />

          <input
            id={id}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete={autocomplete}
            required
            maxLength={1024}
            style={{ ...styles.input, paddingRight: 48 }}
            placeholder={label}
          />

          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((shown) => !shown)}
            style={{
              position: "absolute",
              right: 11,
              border: 0,
              background: "transparent",
              color: "#806a7e",
              cursor: "pointer",
              display: "flex",
              padding: 5,
            }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    );
  }

  function renderAuthPage() {
    const isSignup = page === "signup";
    const isForgot = page === "forgot";

    const title = isSignup
      ? "Create your account"
      : isForgot
        ? "Forgot your password?"
        : "Welcome back";

    const subtitle = isSignup
      ? "Meet new people and start making meaningful connections."
      : isForgot
        ? "Password recovery is not enabled yet."
        : "Sign in to continue your Heartora journey.";

    return (
      <main style={styles.main}>
        <section style={styles.panel}>
          <button
            type="button"
            style={{
              ...styles.navButton,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              paddingLeft: 0,
            }}
            onClick={() => navigate("discover")}
          >
            <ArrowLeft size={17} /> Back to Heartora
          </button>

          <div style={{ marginTop: 25 }}>
            <div style={styles.badge}>
              <Heart size={15} fill="currentColor" />
              HEARTORA
            </div>

            <h1
              style={{
                fontSize: "clamp(29px,5vw,38px)",
                letterSpacing: "-1.2px",
                margin: "20px 0 9px",
              }}
            >
              {title}
            </h1>

            <p style={styles.muted}>{subtitle}</p>
          </div>

          {renderAuthNotice()}

          {isSignup ? (
            <form onSubmit={handleSignup}>
              <div style={styles.inputGroup}>
                <label htmlFor="fullName" style={styles.label}>
                  Full name
                </label>
                <div style={styles.inputWrap}>
                  <UserRound size={17} style={styles.inputIcon} />
                  <input
                    id="fullName"
                    style={styles.input}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    required
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="displayName" style={styles.label}>
                  Display name
                </label>
                <div style={styles.inputWrap}>
                  <Heart size={17} style={styles.inputIcon} />
                  <input
                    id="displayName"
                    style={styles.input}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    autoComplete="nickname"
                    maxLength={40}
                    required
                    placeholder="What should members call you?"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="signupEmail" style={styles.label}>
                  Email address
                </label>
                <div style={styles.inputWrap}>
                  <Mail size={17} style={styles.inputIcon} />
                  <input
                    id="signupEmail"
                    type="email"
                    style={styles.input}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    maxLength={254}
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="birthDate" style={styles.label}>
                  Date of birth
                </label>
                <div style={styles.inputWrap}>
                  <CalendarDays size={17} style={styles.inputIcon} />
                  <input
                    id="birthDate"
                    type="date"
                    style={styles.input}
                    value={birthDate}
                    onChange={(event) => setBirthDate(event.target.value)}
                    autoComplete="bday"
                    max={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <p style={{ ...styles.muted, fontSize: 12, margin: "6px 0 0" }}>
                  Heartora is for adults aged 18 and older.
                </p>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="signupCountry" style={styles.label}>
                  Country
                </label>
                <select
                  id="signupCountry"
                  style={styles.select}
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  required
                >
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="signupPostalCode" style={styles.label}>
                  ZIP or postal code
                </label>
                <div style={styles.inputWrap}>
                  <MapPin size={17} style={styles.inputIcon} />
                  <input
                    id="signupPostalCode"
                    style={styles.input}
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    autoComplete="postal-code"
                    maxLength={20}
                    required
                    placeholder="Enter your postal code"
                  />
                </div>
              </div>

              {renderPasswordField(
                "Password",
                password,
                setPassword,
                "signupPassword",
                "new-password",
              )}

              {renderPasswordField(
                "Confirm password",
                confirmPassword,
                setConfirmPassword,
                "confirmPassword",
                "new-password",
              )}

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={acceptedAge}
                  onChange={(event) => setAcceptedAge(event.target.checked)}
                  required
                />
                <span>
                  I confirm that I am at least 18 years old.
                </span>
              </label>

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  required
                />
                <span>
                  I agree to use Heartora respectfully and follow its terms
                  and safety rules.
                </span>
              </label>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  ...styles.primaryButton,
                  width: "100%",
                  marginTop: 23,
                  opacity: authLoading ? 0.7 : 1,
                  cursor: authLoading ? "wait" : "pointer",
                }}
              >
                {authLoading ? "Creating account…" : "Create free account"}
                {!authLoading && <ChevronRight size={18} />}
              </button>

              <p
                style={{
                  ...styles.muted,
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("signin")}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#9a2d6c",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Sign in
                </button>
              </p>
            </form>
          ) : isForgot ? (
            <form onSubmit={handleForgotPassword}>
              <div style={styles.inputGroup}>
                <label htmlFor="forgotEmail" style={styles.label}>
                  Email address
                </label>
                <div style={styles.inputWrap}>
                  <Mail size={17} style={styles.inputIcon} />
                  <input
                    id="forgotEmail"
                    type="email"
                    style={styles.input}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ ...styles.primaryButton, width: "100%", marginTop: 22 }}
              >
                Continue
              </button>

              <button
                type="button"
                style={{
                  ...styles.secondaryButton,
                  width: "100%",
                  marginTop: 12,
                }}
                onClick={() => navigate("signin")}
              >
                Return to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignin}>
              <div style={styles.inputGroup}>
                <label htmlFor="signinEmail" style={styles.label}>
                  Email address
                </label>
                <div style={styles.inputWrap}>
                  <Mail size={17} style={styles.inputIcon} />
                  <input
                    id="signinEmail"
                    type="email"
                    style={styles.input}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    maxLength={254}
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {renderPasswordField(
                "Password",
                password,
                setPassword,
                "signinPassword",
                "current-password",
              )}

              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate("forgot")}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#9a2d6c",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                style={{
                  ...styles.primaryButton,
                  width: "100%",
                  marginTop: 22,
                  opacity: authLoading ? 0.7 : 1,
                  cursor: authLoading ? "wait" : "pointer",
                }}
              >
                {authLoading ? "Signing in…" : "Sign in"}
                {!authLoading && <ChevronRight size={18} />}
              </button>

              <p
                style={{
                  ...styles.muted,
                  textAlign: "center",
                  marginTop: 22,
                }}
              >
                New to Heartora?{" "}
                <button
                  type="button"
                  onClick={() => navigate("signup")}
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "#9a2d6c",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Join free
                </button>
              </p>
            </form>
          )}

          {currentUser && (
            <div
              style={{
                ...styles.notice,
                background: "#eaf8ef",
                color: "#236a3b",
              }}
            >
              Signed in as {currentUser.displayName}.{" "}
              <button
                type="button"
                onClick={() => navigate("discover")}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "inherit",
                  textDecoration: "underline",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Continue browsing
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  function renderDiscover() {
    return (
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.badge}>
            <Sparkles size={15} />
            CONNECTIONS THAT MATTER
          </div>

          <h1 style={styles.heroTitle}>
            Your next chapter
            <br />
            starts with <span style={styles.accent}>Heartora.</span>
          </h1>

          <p style={styles.paragraph}>
            Meet new people, discover meaningful connections, and explore
            possibilities with a community built around respect and genuine
            connection.
          </p>

          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate(currentUser ? "discover" : "signup")}
            >
              <Heart size={18} />
              {currentUser ? "Explore Heartora" : "Join Heartora free"}
              <ChevronRight size={17} />
            </button>

            {!currentUser && (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => navigate("signin")}
              >
                I already have an account
              </button>
            )}
          </div>

          {currentUser && (
            <p style={{ ...styles.paragraph, marginTop: 20 }}>
              Welcome back, {currentUser.displayName}.
            </p>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>A more thoughtful way to connect</h2>
          <p style={styles.sectionText}>
            Heartora is being built for adults who want to discover people
            beyond their immediate circle, with privacy and respect at the
            center of the experience.
          </p>

          <div style={styles.grid}>
            <article style={styles.card}>
              <div style={styles.iconBox}>
                <Users size={23} />
              </div>
              <h3>Meet new people</h3>
              <p style={styles.muted}>
                Create your profile and get ready to discover people with
                different backgrounds, interests, and stories.
              </p>
            </article>

            <article style={styles.card}>
              <div style={styles.iconBox}>
                <Globe2 size={23} />
              </div>
              <h3>Think globally</h3>
              <p style={styles.muted}>
                Heartora is designed with worldwide discovery in mind, using
                country and postal-code preferences.
              </p>
            </article>

            <article style={styles.card}>
              <div style={styles.iconBox}>
                <ShieldCheck size={23} />
              </div>
              <h3>Respect and safety</h3>
              <p style={styles.muted}>
                Adults-only access and clear community expectations are part
                of building a more respectful environment.
              </p>
              <button
                type="button"
                style={{
                  ...styles.navButton,
                  paddingLeft: 0,
                  color: "#922c68",
                }}
                onClick={() => navigate("safety")}
              >
                Explore safety <ChevronRight size={15} />
              </button>
            </article>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.card}>
            <div style={styles.iconBox}>
              <MapPin size={23} />
            </div>
            <h2 style={styles.sectionTitle}>Discover around your area</h2>
            <p style={styles.sectionText}>
              Choose your country, enter a postal or ZIP code, and select a
              preferred distance. This currently saves your preferences only;
              live member matching has not been implemented yet.
            </p>

            <form onSubmit={discoverMatches} style={{ marginTop: 22 }}>
              <div style={styles.formGrid}>
                <div>
                  <label htmlFor="discoveryCountry" style={styles.label}>
                    Country
                  </label>
                  <select
                    id="discoveryCountry"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    style={styles.select}
                  >
                    {countries.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="discoveryPostalCode" style={styles.label}>
                    ZIP or postal code
                  </label>
                  <input
                    id="discoveryPostalCode"
                    value={postalCode}
                    onChange={(event) => setPostalCode(event.target.value)}
                    style={styles.plainInput}
                    maxLength={20}
                    placeholder="Enter postal code"
                  />
                </div>

                <div>
                  <label htmlFor="distance" style={styles.label}>
                    Preferred distance
                  </label>
                  <select
                    id="distance"
                    value={distance}
                    onChange={(event) => setDistance(event.target.value)}
                    style={styles.select}
                  >
                    <option value="10">10 miles</option>
                    <option value="25">25 miles</option>
                    <option value="50">50 miles</option>
                    <option value="100">100 miles</option>
                    <option value="250">250 miles</option>
                    <option value="worldwide">Worldwide</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{ ...styles.primaryButton, marginTop: 19 }}
              >
                <Search size={18} />
                Save discovery preferences
              </button>

              {locationNotice && (
                <div
                  role="status"
                  style={{
                    ...styles.notice,
                    background: "#f8eff7",
                    color: "#78315f",
                    border: "1px solid #edd7e7",
                  }}
                >
                  {locationNotice}
                </div>
              )}
            </form>
          </div>
        </section>

        <section style={styles.section}>
          <div
            style={{
              ...styles.hero,
              textAlign: "center",
              padding: "clamp(30px,5vw,55px)",
            }}
          >
            <div style={{ ...styles.iconBox, margin: "0 auto 18px" }}>
              <MessageCircle size={23} />
            </div>
            <h2 style={styles.sectionTitle}>Your story is still unfolding</h2>
            <p style={{ ...styles.sectionText, margin: "0 auto" }}>
              Take the first step. Create your free account and prepare to
              discover what meaningful connections could look like for you.
            </p>
            <div style={{ ...styles.buttonRow, justifyContent: "center" }}>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={() => navigate(currentUser ? "about" : "signup")}
              >
                {currentUser ? "Learn about Heartora" : "Get started for free"}
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  function renderAbout() {
    return (
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.badge}>
            <Heart size={15} fill="currentColor" />
            OUR STORY
          </div>
          <h1 style={styles.heroTitle}>
            Connection should feel <span style={styles.accent}>human.</span>
          </h1>
          <p style={styles.paragraph}>
            Heartora is a worldwide dating and social discovery platform in
            development. Our goal is to make it easier for adults to meet
            people, start conversations, and explore genuine connections.
          </p>
          <div style={styles.buttonRow}>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate("signup")}
            >
              Join Heartora <ChevronRight size={17} />
            </button>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>What we believe</h2>
          <div style={styles.grid}>
            <article style={styles.card}>
              <div style={styles.iconBox}>
                <Heart size={23} />
              </div>
              <h3>Authentic connections</h3>
              <p style={styles.muted}>
                We want to create space for people to meet without losing
                sight of kindness, honesty, and mutual respect.
              </p>
            </article>

            <article style={styles.card}>
              <div style={styles.iconBox}>
                <Globe2 size={23} />
              </div>
              <h3>A worldwide community</h3>
              <p style={styles.muted}>
                Our goal is to support discovery across countries and
                communities while making location preferences useful.
              </p>
            </article>

            <article style={styles.card}>
              <div style={styles.iconBox}>
                <ShieldCheck size={23} />
              </div>
              <h3>Safety matters</h3>
              <p style={styles.muted}>
                A good community needs clear expectations, privacy protections,
                and ways to report harmful behavior.
              </p>
              <button
                type="button"
                style={{ ...styles.navButton, paddingLeft: 0, color: "#922c68" }}
                onClick={() => navigate("safety")}
              >
                Read our safety principles <ChevronRight size={15} />
              </button>
            </article>
          </div>
        </section>
      </main>
    );
  }

  function renderSafety() {
    return (
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.badge}>
            <ShieldCheck size={15} />
            SAFETY FIRST
          </div>
          <h1 style={styles.heroTitle}>
            Your safety is <span style={styles.accent}>important.</span>
          </h1>
          <p style={styles.paragraph}>
            Meaningful connections begin with respect. Heartora is intended
            for adults aged 18 and older, and safety needs to remain a core
            part of the community.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Keep these principles in mind</h2>
          <div style={styles.grid}>
            <article style={styles.card}>
              <div style={styles.iconBox}>
                <UserRound size={23} />
              </div>
              <h3>Protect your personal information</h3>
              <p style={styles.muted}>
                Avoid sharing your home address, financial information,
                passwords, or identity documents with people you have just
                met online.
              </p>
            </article>

            <article style={styles.card}>
              <div style={styles.iconBox}>
                <ShieldCheck size={23} />
              </div>
              <h3>Respect boundaries</h3>
              <p style={styles.muted}>
                Treat other members respectfully. Do not threaten, harass,
                pressure, or impersonate other people.
              </p>
            </article>

            <article style={styles.card}>
              <div style={styles.iconBox}>
                <MessageCircle size={23} />
              </div>
              <h3>Be careful with money</h3>
              <p style={styles.muted}>
                Be cautious of requests for money, gift cards, cryptocurrency,
                or urgent financial assistance from people you meet online.
              </p>
            </article>
          </div>

          <div style={{ ...styles.card, marginTop: 20 }}>
            <h3>Important information</h3>
            <p style={styles.muted}>
              These are general safety principles, not a substitute for
              operational moderation tools. Reporting, blocking, identity
              verification, and other enforcement features must be implemented
              before Heartora is ready for a full public launch.
            </p>
          </div>
        </section>
      </main>
    );
  }
  function renderPremium() {
  const plans = [
    {
      name: "Monthly",
      price: "$14.99",
      period: "/month",
      description: "Try all the benefits of Heartora Premium.",
      features: [
        "Unlimited likes",
        "See who likes you",
        "Advanced matching filters",
        "Enhanced worldwide discovery",
        "Rewind profiles",
        "Premium member badge",
        "Ad-free browsing",
      ],
      featured: false,
    },
    {
      name: "3 Months",
      price: "$35.97",
      period: "/3 months",
      description: "Enjoy Premium with a little extra flexibility.",
      features: [
        "Everything in Monthly",
        "Equivalent to $11.99/month",
        "Explore connections worldwide",
        "Premium member badge",
      ],
      featured: true,
    },
    {
      name: "Annual",
      price: "$95.88",
      period: "/year",
      description: "Our best planned price for long-term members.",
      features: [
        "Everything in Premium",
        "Equivalent to $7.99/month",
        "12 months of planned access",
        "Best monthly value",
      ],
      featured: false,
    },
  ];

  return (
    <main style={styles.main}>
      <section style={styles.panel}>
        <div style={styles.badge}>
          <Sparkles size={15} />
          HEARTORA PREMIUM
        </div>

        <h1
  style={{
    ...styles.sectionTitle,
    textAlign: "center",
    marginTop: 24,
  }}
>
  Make meaningful connections
</h1>

        <p style={{ ...styles.muted, textAlign: "center" }}>
          Discover more possibilities with planned Premium features.
          Join Heartora for free, or explore the membership options below.
        </p>

        <div className="heartora-premium-grid">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={
                plan.featured
                  ? "heartora-premium-card featured"
                  : "heartora-premium-card"
              }
            >
              {plan.featured && (
                <div className="heartora-popular-badge">
                  POPULAR CHOICE
                </div>
              )}

              <h2>{plan.name}</h2>

              <div className="heartora-premium-price">
                {plan.price}
              </div>

              <p className="heartora-premium-period">
                {plan.period}
              </p>

              <p className="heartora-premium-description">
                {plan.description}
              </p>

              <ul className="heartora-premium-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="heartora-premium-button"
                onClick={() =>
                  window.alert(
                    "Heartora Premium checkout is not available yet. " +
                    "No payment has been taken. We'll enable subscriptions " +
                    "after secure payment processing is connected."
                  )
                }
              >
                Explore this plan
                <ChevronRight size={16} />
              </button>
            </article>
          ))}
        </div>

        <p className="heartora-premium-disclaimer">
          Premium features and pricing are a preview. Paid subscriptions
          are not yet available, and no payment will be taken.
        </p>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            type="button"
            onClick={() => navigate("discover")}
            style={styles.secondaryButton}
          >
            <ArrowLeft size={16} />
            Back to Discover
          </button>
        </div>
      </section>
    </main>
  );
    }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
  <div className="heartora-header-inner" style={styles.headerInner}>
    {renderBrand()}

    {!currentUser && (
      <button
        type="button"
        className="heartora-join-button"
        onClick={() => navigate("signup")}
        style={styles.primaryButton}
      >
        Join free
        <ChevronRight size={16} />
      </button>
    )}

    <button
      type="button"
      className="heartora-menu-button"
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      aria-expanded={menuOpen}
      aria-controls="heartora-main-navigation"
      onClick={() => setMenuOpen((open) => !open)}
    >
      {menuOpen ? <X size={19} /> : <Menu size={19} />}
    </button>

    <nav
      id="heartora-main-navigation"
      aria-label="Main navigation"
      className={
        menuOpen
          ? "heartora-navigation open"
          : "heartora-navigation"
      }
      style={styles.nav}
    >
      <button
        type="button"
        style={styles.navButton}
        onClick={() => navigate("discover")}
      >
        Discover
      </button>

      <button
        type="button"
        style={styles.navButton}
        onClick={() => navigate("about")}
      >
        About
      </button>

      <button
        type="button"
        style={styles.navButton}
        onClick={() => navigate("safety")}
      >
        Safety
      </button>
      <button
  type="button"
  style={styles.navButton}
  onClick={() => navigate("premium")}
>
  <Sparkles size={15} />
  Premium
</button>

      {currentUser ? (
        <>
          <span
            style={{
              padding: "8px 10px",
              color: "#7d2459",
              fontWeight: 600,
            }}
          >
            {currentUser.displayName}
          </span>

          <button
            type="button"
            style={styles.navButton}
            onClick={handleSignout}
            disabled={authLoading}
          >
            <LogOut size={16} />
            {authLoading ? "Please wait…" : "Sign out"}
          </button>
        </>
      ) : (
        <button
          type="button"
          style={styles.navButton}
          onClick={() => navigate("signin")}
        >
          Sign in
        </button>
      )}
    </nav>
  </div>
</header>

      {page === "discover" && renderDiscover()}
{page === "about" && renderAbout()}
{page === "safety" && renderSafety()}
{page === "premium" && renderPremium()}

{(page === "signup" ||
  page === "signin" ||
  page === "forgot") &&
  renderAuthPage()}

      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <button
            type="button"
            style={styles.brand}
            onClick={() => navigate("discover")}
          >
            <Heart size={22} fill="currentColor" />
            <span>Heartora</span>
          </button>

          <p style={{ ...styles.muted, margin: 0 }}>
            Made for meaningful connections.
          </p>

          <div style={styles.nav}>
            <button
              type="button"
              style={styles.navButton}
              onClick={() => navigate("about")}
            >
              About
            </button>
            <button
              type="button"
              style={styles.navButton}
              onClick={() => navigate("safety")}
            >
              Safety
            </button>
            <button
  type="button"
  onClick={() => navigate("premium")}
  style={styles.navButton}
>
  <Sparkles size={15} style={{ marginRight: 5 }} />
  Premium
</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
