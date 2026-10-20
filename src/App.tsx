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
  Camera,
  Trash2,
  Save,
  LoaderCircle,
  ImagePlus,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import AdminDashboard from "./AdminDashboard";
const stripePromise = loadStripe(
  "pk_live_51UOZYkD4sEidTZkr6lcZuKxjYtLedLhN8QtNB3FVlLusNQLhTu3ap4dGmnbYGR09HvHrAo1lRV6jcv9u16XtdNrd00tTQPvOvx"
);

function HeartoraEmbeddedCheckout({
  priceId,
  onClose,
}: {
  priceId: string;
  onClose: () => void;
}) {
  const fetchClientSecret = async (): Promise<string> => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ priceId }),
    });

    const result = await response.json();

    if (!response.ok || !result.clientSecret) {
      throw new Error(
        result.error || "Unable to start checkout."
      );
    }

    return result.clientSecret;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.75)",
        overflowY: "auto",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 650,
          margin: "40px auto",
          background: "#ffffff",
          color: "#1f2937",
          borderRadius: 16,
          padding: 20,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            display: "block",
            marginLeft: "auto",
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#ffffff",
            cursor: "pointer",
          }}
        >
          Close ✕
        </button>

        <h2>Complete your Heartora subscription</h2>

        <p>
          Your payment form will appear below.
        </p>

        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}

type Page =
  | "discover"
  | "about"
  | "safety"
  | "signup"
  | "signin"
  | "forgot"
  | "premium"
  | "admin"
  | "profile";

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
  const [page, setPage] = useState<Page>(() =>
  window.location.pathname === "/admin" ? "admin" : "discover"
);
  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("");
  const [distance, setDistance] = useState("50");
  const [locationNotice, setLocationNotice] = useState("");
const [discoveredMembers, setDiscoveredMembers] = useState<
  {
    id: string;
    displayName: string;
    country: string;
    bio: string;
    city: string;
    profilePhotoUrl: string;
    interests: string;
  }[]
>([]);

const [discoveryLoading, setDiscoveryLoading] = useState(false);
const [discoveryError, setDiscoveryError] = useState("");
const [discoveryPage, setDiscoveryPage] = useState(1);
const [discoveryTotalPages, setDiscoveryTotalPages] = useState(0);
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
    // HEARTORA MEMBER PROFILE
  const [profileBio, setProfileBio] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileInterests, setProfileInterests] = useState("");
  const [profileVisible, setProfileVisible] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<Notice | null>(null);

  // HEARTORA MEMBER PHOTOS
  const [profilePhotos, setProfilePhotos] = useState<
    {
      id: string;
      url?: string;
      photoUrl?: string;
      profilePhotoUrl?: string;
      isPrimary?: number;
      is_primary?: number;
    }[]
  >([]);

  const [photosLoading, setPhotosLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
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
  // Load the signed-in member's profile and photos.
  async function loadMemberProfile() {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    setProfileLoading(true);
    setPhotosLoading(true);
    setProfileNotice(null);

    try {
      const profileResponse = await fetch("/api/profile/me", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok || !profileData.success) {
        throw new Error(
          profileData.error || "Unable to load your profile.",
        );
      }

      const profile = profileData.profile ?? profileData;

      setProfileBio(profile.bio ?? "");
      setProfileCity(profile.city ?? "");
      setProfileInterests(profile.interests ?? "");
      setProfileVisible(
        profile.showInDiscovery === true ||
          profile.showInDiscovery === 1 ||
          profile.show_in_discovery === 1,
      );
    } catch (error) {
      setProfileNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load your profile.",
      });
    } finally {
      setProfileLoading(false);
    }

    try {
      const photoResponse = await fetch("/api/profile/photos", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const photoData = await photoResponse.json();

      if (!photoResponse.ok || !photoData.success) {
        throw new Error(
          photoData.error || "Unable to load your photos.",
        );
      }

      setProfilePhotos(
        Array.isArray(photoData.photos) ? photoData.photos : [],
      );
    } catch (error) {
      setProfileNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to load your photos.",
      });
    } finally {
      setPhotosLoading(false);
    }
  }

  // Save profile details.
  async function saveMemberProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      navigate("signin");
      return;
    }

    setProfileSaving(true);
    setProfileNotice(null);

    try {
      const result = await authRequest("/api/profile/me", "POST", {
        bio: profileBio.trim(),
        city: profileCity.trim(),
        interests: profileInterests.trim(),
        showInDiscovery: profileVisible,
      });

      setProfileNotice({
        type: "success",
        message: result.message || "Your profile has been saved.",
      });
    } catch (error) {
      setProfileNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to save your profile.",
      });
    } finally {
      setProfileSaving(false);
    }
  }

  // Upload a profile photo to private Cloudflare R2 storage.
  async function uploadMemberPhoto(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentUser) {
      navigate("signin");
      return;
    }

    const form = event.currentTarget;
    const input = form.elements.namedItem("photo");

    if (!(input instanceof HTMLInputElement) || !input.files?.length) {
      setProfileNotice({
        type: "error",
        message: "Please select a photo first.",
      });
      return;
    }

    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
      setProfileNotice({
        type: "error",
        message: "Each photo must be 5 MB or smaller.",
      });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileNotice({
        type: "error",
        message: "Please choose a JPEG, PNG, or WebP image.",
      });
      return;
    }

    if (profilePhotos.length >= 8) {
      setProfileNotice({
        type: "error",
        message: "You can upload up to 8 profile photos.",
      });
      return;
    }

    setPhotoUploading(true);
    setProfileNotice(null);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch("/api/profile/photos", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to upload this photo.");
      }

      input.value = "";

      await loadMemberProfile();

      setProfileNotice({
        type: "success",
        message: "Your photo has been uploaded successfully.",
      });
    } catch (error) {
      setProfileNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload this photo.",
      });
    } finally {
      setPhotoUploading(false);
    }
  }

  // Delete one of the signed-in member's photos.
  async function deleteMemberPhoto(photoId: string) {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setDeletingPhotoId(photoId);
    setProfileNotice(null);

    try {
      const response = await fetch(
        `/api/profile/photos/${encodeURIComponent(photoId)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to delete this photo.");
      }

      await loadMemberProfile();

      setProfileNotice({
        type: "success",
        message: "Your photo has been deleted.",
      });
    } catch (error) {
      setProfileNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete this photo.",
      });
    } finally {
      setDeletingPhotoId(null);
    }
  }
  
  async function discoverMatches(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!currentUser) {
    setLocationNotice("Please sign in to discover members.");
    navigate("signin");
    return;
  }

  if (!country.trim() || !postalCode.trim()) {
    setLocationNotice(
      "Please select your country and enter your postal or ZIP code.",
    );
    return;
  }

  setDiscoveryLoading(true);
  setDiscoveryError("");
  setLocationNotice("");
  setDiscoveredMembers([]);
  setDiscoveryPage(1);

  try {
    const params = new URLSearchParams({
      country: distance === "worldwide" ? "worldwide" : country.trim(),
      page: "1",
    });

    const response = await fetch(
      `/api/discovery/members?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Unable to load members right now.",
      );
    }

    setDiscoveredMembers(data.members ?? []);
    setDiscoveryTotalPages(data.pagination?.totalPages ?? 0);

    const total = data.pagination?.total ?? 0;

    setLocationNotice(
      total > 0
        ? `Found ${total} member${total === 1 ? "" : "s"}.`
        : "No members were found for this discovery selection yet.",
    );
  } catch (error) {
    setDiscoveryError(
      error instanceof Error
        ? error.message
        : "Unable to load members right now.",
    );
  } finally {
    setDiscoveryLoading(false);
  }
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

setAuthNotice(null);
setPage("discover");
window.history.replaceState({}, "", "/");
       
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

setDiscoveryError("");
setDiscoveryLoading(true);
setDiscoveryPage(1);
setDiscoveredMembers([]);
setLocationNotice("");

navigate("discover");

try {
  const params = new URLSearchParams({
    country: distance === "worldwide" ? "worldwide" : country.trim(),
    page: "1",
  });

  const response = await fetch(
    `/api/discovery/members?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Unable to load members right now.",
    );
  }

  setDiscoveredMembers(data.members ?? []);
  setDiscoveryTotalPages(data.pagination?.totalPages ?? 0);

  const total = data.pagination?.total ?? 0;

  setLocationNotice(
    total > 0
      ? `Found ${total} member${total === 1 ? "" : "s"}.`
      : "No members are available to discover yet.",
  );
} catch (error) {
  setDiscoveryError(
    error instanceof Error
      ? error.message
      : "Unable to load members right now.",
  );
} finally {
  setDiscoveryLoading(false);
}
        
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
                            {discoveryLoading && (
                <div role="status" style={styles.notice}>
                  Loading Heartora members...
                </div>
              )}

              {discoveryError && (
                <div
                  role="alert"
                  style={{
                    ...styles.notice,
                    background: "#fff0f2",
                    color: "#a21d45",
                    border: "1px solid #f3c6d2",
                  }}
                >
                  {discoveryError}
                </div>
              )}

              {discoveredMembers.length > 0 && (
                <section style={{ marginTop: 28 }}>
                  <h3 style={styles.sectionTitle}>
                    Members to discover
                  </h3>

                  <div style={styles.grid}>
                    {discoveredMembers.map((member) => (
                      <article
                        key={member.id}
                        style={styles.card}
                      >
                        {member.profilePhotoUrl ? (
                          <img
                            src={member.profilePhotoUrl}
                            alt={`${member.displayName}'s profile`}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: 220,
                              objectFit: "cover",
                              borderRadius: 14,
                              marginBottom: 14,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: 140,
                              borderRadius: 14,
                              marginBottom: 14,
                              background:
                                "linear-gradient(135deg, #fce7f3, #ede9fe)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#922c68",
                              fontSize: 38,
                              fontWeight: 700,
                            }}
                            aria-label="No profile photo"
                          >
                            {member.displayName
                              ?.trim()
                              .charAt(0)
                              .toUpperCase() || "H"}
                          </div>
                        )}

                        <h3 style={{ margin: "0 0 6px" }}>
                          {member.displayName}
                        </h3>

                        <p style={styles.muted}>
                          {[member.city, member.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {member.bio && (
                          <p style={styles.muted}>
                            {member.bio}
                          </p>
                        )}

                        {member.interests && (
                          <p style={styles.muted}>
                            <strong>Interests:</strong>{" "}
                            {member.interests}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>

                  {discoveryTotalPages > 1 && (
                    <div
                      style={{
                        ...styles.buttonRow,
                        justifyContent: "center",
                        marginTop: 20,
                      }}
                    >
                      <button
                        type="button"
                        style={styles.secondaryButton}
                        disabled={
                          discoveryLoading || discoveryPage <= 1
                        }
                        onClick={() => {
                          setDiscoveryPage((page) =>
                            Math.max(1, page - 1),
                          );
                        }}
                      >
                        Previous
                      </button>

                      <span style={styles.muted}>
                        Page {discoveryPage} of {discoveryTotalPages}
                      </span>

                      <button
                        type="button"
                        style={styles.secondaryButton}
                        disabled={
                          discoveryLoading ||
                          discoveryPage >= discoveryTotalPages
                        }
                        onClick={() => {
                          setDiscoveryPage((page) => page + 1);
                        }}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
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
      priceId: "price_1UQwm1D4sEidTZkrl2sXAmYo",
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
      priceId: "price_1UQwoDD4sEidTZkrDYJq8CRJ",
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
      priceId: "price_1UQwvxD4sEidTZkriAaZ5uMN",
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
  onClick={() => {
    if (!currentUser) {
      setAuthNotice({
        type: "info",
        message: "Please sign in before subscribing to Heartora Premium.",
      });
      navigate("signin");
      return;
    }

    setCheckoutPriceId(plan.priceId);
  }}
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
if (page === "admin") {
  return (
    <AdminDashboard
      onBack={() => {
        window.history.pushState({}, "", "/");
        navigate("discover");
      }}
      onSignout={() => {
        void handleSignout();
      }}
    />
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
      {checkoutPriceId && (
  <HeartoraEmbeddedCheckout
    priceId={checkoutPriceId}
    onClose={() => setCheckoutPriceId(null)}
  />
)}

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
