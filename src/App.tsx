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
  | "profile"
  | "member"
  | "inbox"
  | "conversation";

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
// HEARTORA: PUBLIC MEMBER PROFILE
type MemberProfile = {
  id: string;
  displayName: string;
  age: number | null;
  country: string;
  city: string | null;
  bio: string | null;
  interests: string | null;
  profilePhotoUrl: string | null;
  photos: {
    id: string;
    url: string;
    isPrimary?: boolean;
  }[];
};

// HEARTORA: PRIVATE MESSAGE
type PrivateMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};

// HEARTORA: INBOX CONVERSATION
type InboxConversation = {
  id: string;
  updatedAt: string;
  member: {
    id: string;
    displayName: string;
    country: string;
    city: string | null;
    bio: string | null;
    profilePhotoUrl: string | null;
  };
  lastMessage: {
    id: string;
    body: string | null;
    senderId: string | null;
    createdAt: string | null;
  } | null;
  unreadCount: number;
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
  // HEARTORA: MEMBER PROFILE VIEW
const [selectedMember, setSelectedMember] =
  useState<MemberProfile | null>(null);

const [memberProfileLoading, setMemberProfileLoading] =
  useState(false);

const [memberProfileError, setMemberProfileError] =
  useState("");

const [memberActionLoading, setMemberActionLoading] =
  useState(false);

// HEARTORA: PRIVATE MESSAGING
const [inbox, setInbox] = useState<InboxConversation[]>([]);
const [inboxLoading, setInboxLoading] = useState(false);
const [inboxError, setInboxError] = useState("");

const [activeConversationId, setActiveConversationId] =
  useState<string | null>(null);

const [messages, setMessages] = useState<PrivateMessage[]>([]);
const [messagesLoading, setMessagesLoading] = useState(false);
const [messagesError, setMessagesError] = useState("");
const [messageDraft, setMessageDraft] = useState("");
const [messageSending, setMessageSending] = useState(false);

// HEARTORA: MEMBER SAFETY
const [reportReason, setReportReason] = useState("other");
const [reportDetails, setReportDetails] = useState("");
const [showReportForm, setShowReportForm] = useState(false);
const [messagingNotice, setMessagingNotice] =
  useState<Notice | null>(null);
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
    // HEARTORA: LOAD A PUBLIC MEMBER PROFILE
  async function loadMemberDetails(memberId: string) {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    setMemberProfileLoading(true);
    setMemberProfileError("");
    setSelectedMember(null);

    try {
      const result = await authRequest(
        `/api/members/${encodeURIComponent(memberId)}`,
        "GET",
      );

      const raw = (
        result as AuthResponse & {
          member?: Record<string, unknown>;
          profile?: Record<string, unknown>;
        }
      );

      const data = raw.member ?? raw.profile;

      if (!data) {
        throw new Error("The member profile could not be found.");
      }

      const rawPhotos = Array.isArray(data.photos)
        ? data.photos as Record<string, unknown>[]
        : [];

      const profile: MemberProfile = {
        id: String(data.id ?? memberId),
        displayName: String(data.displayName ?? data.display_name ?? "Heartora member"),
        age:
          typeof data.age === "number"
            ? data.age
            : null,
        country: String(data.country ?? ""),
        city:
          data.city == null
            ? null
            : String(data.city),
        bio:
          data.bio == null
            ? null
            : String(data.bio),
        interests:
          data.interests == null
            ? null
            : String(data.interests),
        profilePhotoUrl:
          data.profilePhotoUrl == null && data.profile_photo_url == null
            ? null
            : String(data.profilePhotoUrl ?? data.profile_photo_url),
        photos: rawPhotos.map((photo) => ({
          id: String(photo.id ?? ""),
          url: String(
            photo.url ??
            photo.photoUrl ??
            photo.profilePhotoUrl ??
            photo.profile_photo_url ??
            "",
          ),
          isPrimary:
            photo.isPrimary === true ||
            photo.isPrimary === 1 ||
            photo.is_primary === 1,
        })),
      };

      setSelectedMember(profile);
      setShowReportForm(false);
      setReportReason("other");
      setReportDetails("");
      navigate("member");
    } catch (error) {
      setMemberProfileError(
        error instanceof Error
          ? error.message
          : "Unable to load this member's profile.",
      );
    } finally {
      setMemberProfileLoading(false);
    }
  }

  // HEARTORA: LOAD THE PRIVATE MESSAGE INBOX
  async function loadInbox() {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    setInboxLoading(true);
    setInboxError("");

    try {
      const response = await fetch("/api/messages/inbox", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Unable to load your inbox.",
        );
      }

      const conversations = Array.isArray(result.conversations)
        ? result.conversations
        : Array.isArray(result.inbox)
          ? result.inbox
          : [];

      setInbox(conversations);
    } catch (error) {
      setInboxError(
        error instanceof Error
          ? error.message
          : "Unable to load your inbox.",
      );
    } finally {
      setInboxLoading(false);
    }
  }

  // HEARTORA: LOAD MESSAGES IN A CONVERSATION
  async function loadMessages(conversationId: string) {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    setMessagesLoading(true);
    setMessagesError("");

    try {
      const result = await authRequest(
        `/api/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
        "GET",
      );

      const data = result as AuthResponse & {
        messages?: PrivateMessage[];
      };

      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : [],
      );
    } catch (error) {
      setMessagesError(
        error instanceof Error
          ? error.message
          : "Unable to load messages.",
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  // HEARTORA: OPEN AN EXISTING CONVERSATION
  async function openConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setMessageDraft("");
    setMessages([]);
    setMessagesError("");
    navigate("conversation");
    await loadMessages(conversationId);
  }

  // HEARTORA: START A PRIVATE CONVERSATION
  async function startConversation(memberId: string) {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    if (memberId === currentUser.id) {
      setMessagingNotice({
        type: "info",
        message: "You cannot start a conversation with yourself.",
      });
      return;
    }

    setMemberActionLoading(true);
    setMessagingNotice(null);

    try {
      const result = await authRequest(
        "/api/messages/conversations",
        "POST",
        { memberId },
      );

      const data = result as AuthResponse & {
        conversation?: { id?: string };
        conversationId?: string;
      };

      const conversationId =
        data.conversation?.id ??
        data.conversationId;

      if (!conversationId) {
        throw new Error(
          "The conversation was created, but its ID was not returned.",
        );
      }

      setActiveConversationId(conversationId);
      setMessageDraft("");
      setMessages([]);
      navigate("conversation");

      await loadMessages(conversationId);
      await loadInbox();
    } catch (error) {
      setMessagingNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to start this conversation.",
      });
    } finally {
      setMemberActionLoading(false);
    }
  }

  // HEARTORA: SEND A PRIVATE MESSAGE
  async function sendPrivateMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!currentUser) {
      navigate("signin");
      return;
    }

    if (!activeConversationId) {
      setMessagesError("Please open a conversation first.");
      return;
    }

    const body = messageDraft.trim();

    if (!body) {
      return;
    }

    if (body.length > 2000) {
      setMessagesError(
        "Messages cannot exceed 2,000 characters.",
      );
      return;
    }

    setMessageSending(true);
    setMessagesError("");

    try {
      await authRequest(
        `/api/messages/conversations/${encodeURIComponent(activeConversationId)}/messages`,
        "POST",
        { body },
      );

      setMessageDraft("");

      await loadMessages(activeConversationId);
      await loadInbox();
    } catch (error) {
      setMessagesError(
        error instanceof Error
          ? error.message
          : "Unable to send your message.",
      );
    } finally {
      setMessageSending(false);
    }
  }

  // HEARTORA: BLOCK A MEMBER
  async function blockMember(memberId: string) {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    if (
      !window.confirm(
        "Block this member? You will no longer be able to interact with them through Heartora's supported features.",
      )
    ) {
      return;
    }

    setMemberActionLoading(true);
    setMessagingNotice(null);

    try {
      await authRequest(
        `/api/members/${encodeURIComponent(memberId)}/block`,
        "POST",
      );

      setMessagingNotice({
        type: "success",
        message: "This member has been blocked.",
      });

      setInbox((previous) =>
        previous.filter(
          (conversation) =>
            conversation.member.id !== memberId,
        ),
      );

      setSelectedMember(null);
      navigate("discover");
    } catch (error) {
      setMessagingNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to block this member.",
      });
    } finally {
      setMemberActionLoading(false);
    }
  }

  // HEARTORA: REPORT A MEMBER
  async function reportMember(memberId: string) {
    if (!currentUser) {
      navigate("signin");
      return;
    }

    const allowedReasons = [
      "harassment",
      "fake_profile",
      "scam",
      "inappropriate_content",
      "underage",
      "other",
    ];

    if (!allowedReasons.includes(reportReason)) {
      setMessagingNotice({
        type: "error",
        message: "Please select a valid report reason.",
      });
      return;
    }

    if (reportDetails.trim().length > 2000) {
      setMessagingNotice({
        type: "error",
        message: "Report details cannot exceed 2,000 characters.",
      });
      return;
    }

    setMemberActionLoading(true);
    setMessagingNotice(null);

    try {
      const result = await authRequest(
        `/api/members/${encodeURIComponent(memberId)}/report`,
        "POST",
        {
          reason: reportReason,
          details: reportDetails.trim(),
        },
      );

      setShowReportForm(false);
      setReportDetails("");

      setMessagingNotice({
        type: "success",
        message:
          result.message ||
          "Your report has been submitted for review.",
      });
    } catch (error) {
      setMessagingNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your report.",
      });
    } finally {
      setMemberActionLoading(false);
    }
        }
  
  // HEARTORA: RENDER MEMBER PROFILE
function renderMember() {
  if (memberProfileLoading) {
    return (
      <main className="page-container">
        <p>Loading member profile...</p>
      </main>
    );
  }

  if (memberProfileError || !selectedMember) {
    return (
      <main className="page-container">
        <button
          type="button"
          onClick={() => navigate("discover")}
        >
          <ArrowLeft size={18} /> Back to Discover
        </button>

        <p role="alert">
          {memberProfileError || "This member profile is unavailable."}
        </p>
      </main>
    );
  }

  const member = selectedMember;

  return (
    <main className="page-container">
      <button
        type="button"
        onClick={() => navigate("discover")}
      >
        <ArrowLeft size={18} /> Back to Discover
      </button>

      {messagingNotice && (
        <div
          role="status"
          className={`notice ${messagingNotice.type}`}
        >
          {messagingNotice.message}
        </div>
      )}

      <section className="member-profile">
        <div className="member-profile-header">
          {member.profilePhotoUrl ? (
            <img
              src={member.profilePhotoUrl}
              alt={`${member.displayName}'s profile`}
              className="member-profile-photo"
            />
          ) : (
            <div className="member-profile-photo member-profile-placeholder">
              <UserRound size={48} />
            </div>
          )}

          <div>
            <h1>{member.displayName}</h1>

            <p>
              {member.age !== null ? `${member.age} years old` : ""}
              {member.age !== null && (member.city || member.country)
                ? " · "
                : ""}
              {[member.city, member.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        <div className="member-profile-section">
          <h2>About</h2>
          <p>
            {member.bio || "This member hasn't added a bio yet."}
          </p>
        </div>

        <div className="member-profile-section">
          <h2>Interests</h2>
          <p>
            {member.interests || "No interests listed yet."}
          </p>
        </div>

        {member.photos.length > 0 && (
          <div className="member-profile-section">
            <h2>Photos</h2>

            <div className="member-photo-gallery">
              {member.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={`${member.displayName}'s photo`}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        <div className="member-profile-actions">
          <button
            type="button"
            disabled={memberActionLoading}
            onClick={() => void startConversation(member.id)}
          >
            <MessageCircle size={18} />
            Send Message
          </button>

          <button
            type="button"
            disabled={memberActionLoading}
            onClick={() => {
              setShowReportForm((previous) => !previous);
              setMessagingNotice(null);
            }}
          >
            Report Member
          </button>

          <button
            type="button"
            disabled={memberActionLoading}
            onClick={() => {
              const confirmed = window.confirm(
                `Are you sure you want to block ${member.displayName}?`
              );

              if (confirmed) {
                void blockMember(member.id);
              }
            }}
          >
            Block Member
          </button>
        </div>

        {memberActionLoading && <p>Processing your request...</p>}

        {showReportForm && (
          <form
            className="member-report-form"
            onSubmit={(event) => {
              event.preventDefault();
              void reportMember(member.id);
            }}
          >
            <h2>Report this member</h2>

            <label htmlFor="heartora-report-reason">
              Reason
            </label>

            <select
              id="heartora-report-reason"
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
            >
              <option value="harassment">Harassment</option>
              <option value="fake_profile">Fake profile</option>
              <option value="scam">Scam</option>
              <option value="inappropriate_content">
                Inappropriate content
              </option>
              <option value="underage">Suspected underage user</option>
              <option value="other">Other</option>
            </select>

            <label htmlFor="heartora-report-details">
              Additional details (optional)
            </label>

            <textarea
              id="heartora-report-details"
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Describe the issue..."
            />

            <button
              type="submit"
              disabled={memberActionLoading}
            >
              Submit Report
            </button>

            <button
              type="button"
              onClick={() => setShowReportForm(false)}
            >
              Cancel
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

// HEARTORA: RENDER MESSAGE INBOX
function renderInbox() {
  return (
    <main className="page-container">
      <button
        type="button"
        onClick={() => navigate("discover")}
      >
        <ArrowLeft size={18} /> Back to Discover
      </button>

      <div className="inbox-heading">
        <h1>
          <MessageCircle size={24} /> Messages
        </h1>

        <button
          type="button"
          onClick={() => void loadInbox()}
          disabled={inboxLoading}
        >
          {inboxLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {messagingNotice && (
        <div
          role="status"
          className={`notice ${messagingNotice.type}`}
        >
          {messagingNotice.message}
        </div>
      )}

      {inboxError && (
        <p role="alert">{inboxError}</p>
      )}

      {inboxLoading && inbox.length === 0 && (
        <p>Loading your conversations...</p>
      )}

      {!inboxLoading && !inboxError && inbox.length === 0 && (
        <section className="empty-inbox">
          <MessageCircle size={42} />
          <h2>No messages yet</h2>
          <p>
            Visit a member's profile and send a message to start a
            conversation.
          </p>

          <button
            type="button"
            onClick={() => navigate("discover")}
          >
            Discover Members
          </button>
        </section>
      )}

      <div className="inbox-list">
        {inbox.map((conversation) => (
          <button
            type="button"
            key={conversation.id}
            className="inbox-conversation"
            onClick={() => void openConversation(conversation.id)}
          >
            {conversation.member.profilePhotoUrl ? (
              <img
                src={conversation.member.profilePhotoUrl}
                alt=""
                className="inbox-avatar"
              />
            ) : (
              <span className="inbox-avatar inbox-avatar-placeholder">
                <UserRound size={24} />
              </span>
            )}

            <span className="inbox-conversation-content">
              <strong>{conversation.member.displayName}</strong>

              <span>
                {[conversation.member.city, conversation.member.country]
                  .filter(Boolean)
                  .join(", ")}
              </span>

              <span className="inbox-last-message">
                {conversation.lastMessage?.body || "Start chatting"}
              </span>
            </span>

            {conversation.unreadCount > 0 && (
              <span className="inbox-unread-count">
                {conversation.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}

// HEARTORA: RENDER PRIVATE CONVERSATION
function renderConversation() {
  const conversation = inbox.find(
    (item) => item.id === activeConversationId
  );

  return (
    <main className="page-container">
      <button
        type="button"
        onClick={() => navigate("inbox")}
      >
        <ArrowLeft size={18} /> Back to Messages
      </button>

      <header className="conversation-heading">
        <h1>
          {conversation?.member.displayName || "Conversation"}
        </h1>

        {conversation && (
          <p>
            {[conversation.member.city, conversation.member.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </header>

      {messagingNotice && (
        <div
          role="status"
          className={`notice ${messagingNotice.type}`}
        >
          {messagingNotice.message}
        </div>
      )}

      {messagesError && (
        <p role="alert">{messagesError}</p>
      )}

      {messagesLoading && <p>Loading messages...</p>}

      {!messagesLoading && messages.length === 0 && !messagesError && (
        <p className="empty-conversation">
          No messages yet. Say hello!
        </p>
      )}

      <div className="message-list" aria-live="polite">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUser?.id;

          return (
            <article
              key={message.id}
              className={
                isOwnMessage
                  ? "private-message own-message"
                  : "private-message received-message"
              }
            >
              <p>{message.body}</p>

              <time dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleString()}
              </time>
            </article>
          );
        })}
      </div>

      <form
        className="message-composer"
        onSubmit={sendPrivateMessage}
      >
        <label htmlFor="heartora-message-draft">
          Write a message
        </label>

        <textarea
          id="heartora-message-draft"
          value={messageDraft}
          onChange={(event) => setMessageDraft(event.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Write something kind..."
          required
        />

        <button
          type="submit"
          disabled={
            messageSending ||
            !messageDraft.trim() ||
            !activeConversationId
          }
        >
          {messageSending ? "Sending..." : "Send Message"}
        </button>
      </form>
    </main>
  );
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
  // HEARTORA: MEMBER PROFILE PAGE
  function renderMember() {
    if (memberProfileLoading) {
      return (
        <main className="page-container">
          <p>Loading member profile...</p>
        </main>
      );
    }

    if (memberProfileError) {
      return (
        <main className="page-container">
          <button
            type="button"
            onClick={() => navigate("discover")}
          >
            <ArrowLeft size={18} /> Back to Discover
          </button>

          <p role="alert">{memberProfileError}</p>

          <button
            type="button"
            onClick={() => {
              setMemberProfileError("");
              navigate("discover");
            }}
          >
            Return to Discover
          </button>
        </main>
      );
    }

    if (!selectedMember) {
      return (
        <main className="page-container">
          <h2>Member profile</h2>
          <p>Select a member from Discover to view their profile.</p>

          <button
            type="button"
            onClick={() => navigate("discover")}
          >
            <ArrowLeft size={18} /> Back to Discover
          </button>
        </main>
      );
    }

    const member = selectedMember;

    return (
      <main className="page-container">
        <button
          type="button"
          onClick={() => navigate("discover")}
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={18} /> Back to Discover
        </button>

        {messagingNotice && (
          <div
            role="status"
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 10,
              background:
                messagingNotice.type === "error"
                  ? "#fff0f0"
                  : "#f0fff5",
              color:
                messagingNotice.type === "error"
                  ? "#b42318"
                  : "#176b3a",
            }}
          >
            {messagingNotice.message}
          </div>
        )}

        <section
          className="content-card"
          style={{
            maxWidth: 850,
            margin: "0 auto",
            padding: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "0 0 220px", maxWidth: "100%" }}>
              {member.profilePhotoUrl ? (
                <img
                  src={member.profilePhotoUrl}
                  alt={`${member.displayName}'s profile`}
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    borderRadius: 18,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    maxWidth: 220,
                    aspectRatio: "1 / 1",
                    borderRadius: 18,
                    background: "#fce7ef",
                    display: "grid",
                    placeItems: "center",
                    color: "#c92c60",
                  }}
                >
                  <Users size={64} />
                </div>
              )}
            </div>

            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <h1 style={{ marginTop: 0 }}>
                {member.displayName}
                {member.age !== null ? `, ${member.age}` : ""}
              </h1>

              {(member.city || member.country) && (
                <p>
                  <MapPin
                    size={17}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                    }}
                  />{" "}
                  {[member.city, member.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <h3>About</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {member.bio || "This member hasn't added a bio yet."}
              </p>

              <h3>Interests</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {member.interests || "No interests added yet."}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 20,
                }}
              >
                <button
                  type="button"
                  disabled={memberActionLoading}
                  onClick={() => void startConversation(member.id)}
                >
                  <MessageCircle size={17} /> Message
                </button>

                <button
                  type="button"
                  disabled={memberActionLoading}
                  onClick={() => void blockMember(member.id)}
                >
                  Block member
                </button>

                <button
                  type="button"
                  disabled={memberActionLoading}
                  onClick={() => {
                    setMessagingNotice(null);
                    setShowReportForm((previous) => !previous);
                  }}
                >
                  Report member
                </button>
              </div>
            </div>
          </div>

          {member.photos.length > 0 && (
            <section style={{ marginTop: 30 }}>
              <h2>Photos</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 12,
                }}
              >
                {member.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt={`${member.displayName}'s photo`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {showReportForm && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void reportMember(member.id);
              }}
              style={{
                marginTop: 28,
                padding: 18,
                border: "1px solid #f0c5d5",
                borderRadius: 14,
              }}
            >
              <h2>Report this member</h2>

              <p>
                Please choose the reason that best describes your concern.
              </p>

              <label
                htmlFor="heartora-report-reason"
                style={{ display: "block", marginBottom: 8 }}
              >
                Reason
              </label>

              <select
                id="heartora-report-reason"
                value={reportReason}
                onChange={(event) =>
                  setReportReason(event.target.value)
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <option value="other">Other</option>
                <option value="harassment">Harassment</option>
                <option value="fake_profile">Fake profile</option>
                <option value="scam">Scam or fraud</option>
                <option value="inappropriate_content">
                  Inappropriate content
                </option>
                <option value="underage">Underage member</option>
              </select>

              <label
                htmlFor="heartora-report-details"
                style={{ display: "block", marginBottom: 8 }}
              >
                Additional details (optional)
              </label>

              <textarea
                id="heartora-report-details"
                value={reportDetails}
                onChange={(event) =>
                  setReportDetails(event.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder="Explain what happened..."
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 12,
                  marginBottom: 12,
                }}
              />

              <button
                type="submit"
                disabled={memberActionLoading}
              >
                {memberActionLoading
                  ? "Submitting..."
                  : "Submit report"}
              </button>

              <button
                type="button"
                disabled={memberActionLoading}
                onClick={() => setShowReportForm(false)}
                style={{ marginLeft: 8 }}
              >
                Cancel
              </button>
            </form>
          )}
        </section>
      </main>
    );
  }

  // HEARTORA: PRIVATE MESSAGE INBOX PAGE
  function renderInbox() {
    return (
      <main className="page-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h1>Messages</h1>

          <button
            type="button"
            onClick={() => void loadInbox()}
            disabled={inboxLoading}
          >
            {inboxLoading ? "Refreshing..." : "Refresh inbox"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("discover")}
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={18} /> Back to Discover
        </button>

        {messagingNotice && (
          <p role="status">{messagingNotice.message}</p>
        )}

        {inboxError && (
          <p role="alert" style={{ color: "#b42318" }}>
            {inboxError}
          </p>
        )}

        {inboxLoading && inbox.length === 0 && (
          <p>Loading your conversations...</p>
        )}

        {!inboxLoading && !inboxError && inbox.length === 0 && (
          <section className="content-card" style={{ padding: 24 }}>
            <MessageCircle size={36} />
            <h2>Your inbox is empty</h2>
            <p>
              When you start a conversation with another member, it will
              appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("discover")}
            >
              Discover members
            </button>
          </section>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {inbox.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() =>
                void openConversation(conversation.id)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                width: "100%",
                padding: 16,
                textAlign: "left",
                border: "1px solid #f0dce5",
                borderRadius: 14,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              {conversation.member.profilePhotoUrl ? (
                <img
                  src={conversation.member.profilePhotoUrl}
                  alt=""
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: "#fce7ef",
                    color: "#c92c60",
                    flexShrink: 0,
                  }}
                >
                  <UserRound size={26} />
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>
                  {conversation.member.displayName}
                </strong>

                <p
                  style={{
                    margin: "5px 0",
                    overflowWrap: "anywhere",
                    opacity: 0.8,
                  }}
                >
                  {conversation.lastMessage?.body ||
                    "Start your conversation"}
                </p>

                {conversation.member.city && (
                  <small>
                    {conversation.member.city}
                    {conversation.member.country
                      ? `, ${conversation.member.country}`
                      : ""}
                  </small>
                )}
              </div>

              {conversation.unreadCount > 0 && (
                <span
                  aria-label={`${conversation.unreadCount} unread messages`}
                  style={{
                    minWidth: 24,
                    height: 24,
                    borderRadius: 20,
                    display: "grid",
                    placeItems: "center",
                    background: "#e83e72",
                    color: "#fff",
                    padding: "0 6px",
                    fontSize: 12,
                  }}
                >
                  {conversation.unreadCount}
                </span>
              )}

              <ChevronRight size={20} />
            </button>
          ))}
        </div>
      </main>
    );
  }

  // HEARTORA: PRIVATE CONVERSATION PAGE
  function renderConversation() {
    const conversation = inbox.find(
      (item) => item.id === activeConversationId,
    );

    return (
      <main className="page-container">
        <button
          type="button"
          onClick={() => {
            navigate("inbox");
            void loadInbox();
          }}
          style={{ marginBottom: 20 }}
        >
          <ArrowLeft size={18} /> Back to Messages
        </button>

        <section
          className="content-card"
          style={{
            maxWidth: 850,
            margin: "0 auto",
            padding: 20,
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBottom: 16,
              borderBottom: "1px solid #f0dce5",
            }}
          >
            <MessageCircle size={26} />

            <div>
              <h1 style={{ margin: 0 }}>
                {conversation?.member.displayName || "Conversation"}
              </h1>

              {conversation?.member.country && (
                <small>{conversation.member.country}</small>
              )}
            </div>
          </header>

          {messagesError && (
            <p role="alert" style={{ color: "#b42318" }}>
              {messagesError}
            </p>
          )}

          {messagesLoading && messages.length === 0 && (
            <p>Loading messages...</p>
          )}

          {!messagesLoading && messages.length === 0 && !messagesError && (
            <p style={{ padding: "24px 0" }}>
              No messages yet. Say hello to start the conversation.
            </p>
          )}

          <div
            aria-live="polite"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "20px 0",
              minHeight: 180,
              maxHeight: 450,
              overflowY: "auto",
            }}
          >
            {messages.map((message) => {
              const isMine = message.senderId === currentUser?.id;

              return (
                <div
                  key={message.id}
                  style={{
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "12px 15px",
                    borderRadius: 14,
                    background: isMine ? "#fce7ef" : "#f4f4f5",
                    overflowWrap: "anywhere",
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {message.body}
                  </p>

                  <small
                    style={{
                      display: "block",
                      marginTop: 6,
                      opacity: 0.7,
                    }}
                  >
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleString()
                      : ""}
                  </small>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={sendPrivateMessage}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              borderTop: "1px solid #f0dce5",
              paddingTop: 16,
            }}
          >
            <label
              htmlFor="heartora-message-draft"
              style={{
                position: "absolute",
                width: 1,
                height: 1,
                padding: 0,
                margin: -1,
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Write a message
            </label>

            <textarea
              id="heartora-message-draft"
              value={messageDraft}
              onChange={(event) =>
                setMessageDraft(event.target.value)
              }
              placeholder="Write a message..."
              maxLength={2000}
              rows={2}
              disabled={messageSending}
              style={{
                flex: "1 1 220px",
                minWidth: 0,
                resize: "vertical",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #e5d5dd",
                boxSizing: "border-box",
              }}
            />

            <button
              type="submit"
              disabled={
                messageSending ||
                !messageDraft.trim() ||
                !activeConversationId
              }
            >
              {messageSending ? "Sending..." : "Send"}
            </button>
          </form>

          <small>
            Keep conversations respectful. Never share passwords,
            financial account details, or verification codes.
          </small>
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
    function renderProfile() {
    if (!currentUser) {
      return (
        <main style={styles.main}>
          <section style={styles.panel}>
            <h1 style={styles.sectionTitle}>Your profile</h1>
            <p style={styles.muted}>
              Please sign in to manage your Heartora profile and photos.
            </p>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => navigate("signin")}
            >
              Sign in
            </button>
          </section>
        </main>
      );
    }

    return (
      <main style={styles.main}>
        <section style={styles.hero}>
          <div style={styles.badge}>
            <UserRound size={15} />
            MEMBER PROFILE
          </div>

          <h1 style={styles.heroTitle}>
            Your Heartora <span style={styles.accent}>profile.</span>
          </h1>

          <p style={styles.paragraph}>
            Introduce yourself, share your interests, and choose whether
            other Heartora members can discover your profile.
          </p>
        </section>

        {profileNotice && (
          <div
            role="status"
            aria-live="polite"
            style={{
              ...styles.notice,
              background:
                profileNotice.type === "success"
                  ? "#eaf8ef"
                  : profileNotice.type === "error"
                    ? "#fff0f0"
                    : "#f0f4ff",
              color:
                profileNotice.type === "success"
                  ? "#236a3b"
                  : profileNotice.type === "error"
                    ? "#a42b3b"
                    : "#38558c",
              border: "1px solid #ead5e2",
            }}
          >
            {profileNotice.message}
          </div>
        )}

        <section style={styles.section}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Your account</h2>

            <p style={styles.muted}>
              <strong>Display name:</strong> {currentUser.displayName}
            </p>

            <p style={styles.muted}>
              <strong>Email:</strong> {currentUser.email}
            </p>

            <p style={styles.muted}>
              <strong>Country:</strong> {currentUser.country}
            </p>

            <p style={styles.muted}>
              To protect your account, your email address is not displayed
              on your public discovery profile.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>About you</h2>

            {profileLoading ? (
              <p style={styles.muted}>Loading your profile…</p>
            ) : (
              <form onSubmit={saveMemberProfile}>
                <div style={styles.inputGroup}>
                  <label htmlFor="profileBio" style={styles.label}>
                    About me
                  </label>

                  <textarea
                    id="profileBio"
                    value={profileBio}
                    onChange={(event) => setProfileBio(event.target.value)}
                    maxLength={1000}
                    rows={5}
                    placeholder="Tell other members a little about yourself..."
                    style={{
                      ...styles.plainInput,
                      resize: "vertical",
                      lineHeight: 1.7,
                    }}
                  />

                  <p style={styles.muted}>
                    {profileBio.length}/1000 characters
                  </p>
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="profileCity" style={styles.label}>
                    City or town
                  </label>

                  <input
                    id="profileCity"
                    value={profileCity}
                    onChange={(event) => setProfileCity(event.target.value)}
                    maxLength={100}
                    placeholder="Your city or town"
                    style={styles.plainInput}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="profileInterests" style={styles.label}>
                    Interests
                  </label>

                  <textarea
                    id="profileInterests"
                    value={profileInterests}
                    onChange={(event) =>
                      setProfileInterests(event.target.value)
                    }
                    maxLength={500}
                    rows={3}
                    placeholder="Music, travelling, cooking, movies..."
                    style={{
                      ...styles.plainInput,
                      resize: "vertical",
                      lineHeight: 1.7,
                    }}
                  />

                  <p style={styles.muted}>
                    Separate your interests with commas.
                  </p>
                </div>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={profileVisible}
                    onChange={(event) =>
                      setProfileVisible(event.target.checked)
                    }
                  />

                  <span>
                    <strong>Show my profile in discovery</strong>
                    <br />
                    When enabled, other eligible members may discover your
                    profile. Turn this off to hide it from discovery.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={profileSaving || profileLoading}
                  style={{
                    ...styles.primaryButton,
                    marginTop: 22,
                    opacity: profileSaving ? 0.7 : 1,
                  }}
                >
                  {profileSaving ? (
                    <LoaderCircle size={17} />
                  ) : (
                    <Save size={17} />
                  )}

                  {profileSaving ? "Saving profile…" : "Save profile"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.card}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={styles.iconBox}>
                <Camera size={23} />
              </div>

              <div>
                <h2 style={{ ...styles.sectionTitle, marginBottom: 4 }}>
                  Your photos
                </h2>

                <p style={styles.muted}>
                  Upload up to 8 JPEG, PNG, or WebP photos. Maximum 5 MB
                  per photo.
                </p>
              </div>
            </div>

            <form
              onSubmit={uploadMemberPhoto}
              style={{ marginTop: 22 }}
            >
              <div style={styles.inputGroup}>
                <label htmlFor="memberPhoto" style={styles.label}>
                  Choose a photo
                </label>

                <input
                  id="memberPhoto"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  disabled={photoUploading || profilePhotos.length >= 8}
                  style={{
                    ...styles.plainInput,
                    padding: 10,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={photoUploading || profilePhotos.length >= 8}
                style={{
                  ...styles.primaryButton,
                  marginTop: 14,
                  opacity: photoUploading ? 0.7 : 1,
                }}
              >
                {photoUploading ? (
                  <LoaderCircle size={17} />
                ) : (
                  <ImagePlus size={17} />
                )}

                {photoUploading ? "Uploading photo…" : "Upload photo"}
              </button>
            </form>

            <p style={styles.muted}>
              {profilePhotos.length} of 8 photos uploaded.
            </p>

            {photosLoading ? (
              <p style={styles.muted}>Loading your photos…</p>
            ) : profilePhotos.length === 0 ? (
              <div
                style={{
                  ...styles.notice,
                  background: "#f8eff7",
                  color: "#78315f",
                  border: "1px solid #edd7e7",
                }}
              >
                You have not uploaded any photos yet. Your first uploaded
                photo will automatically become your primary profile photo.
              </div>
            ) : (
              <div style={styles.grid}>
                {profilePhotos.map((photo) => {
                  const photoUrl =
                    photo.url ||
                    photo.photoUrl ||
                    photo.profilePhotoUrl ||
                    `/api/profile/photos/${encodeURIComponent(photo.id)}`;

                  const isPrimary =
  photo.isPrimary === 1 ||
  photo.is_primary === 1;
                   
                  return (
                    <article key={photo.id} style={styles.card}>
                      <img
                        src={photoUrl}
                        alt="Your Heartora profile"
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: 230,
                          objectFit: "cover",
                          borderRadius: 14,
                          background: "#f8eff7",
                        }}
                      />

                      {isPrimary && (
                        <div
                          style={{
                            ...styles.badge,
                            marginTop: 12,
                          }}
                        >
                          <Heart size={14} fill="currentColor" />
                          Primary photo
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={deletingPhotoId === photo.id}
                        onClick={() => void deleteMemberPhoto(photo.id)}
                        style={{
                          ...styles.secondaryButton,
                          width: "100%",
                          marginTop: 12,
                          color: "#a42b3b",
                        }}
                      >
                        {deletingPhotoId === photo.id ? (
                          <LoaderCircle size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}

                        {deletingPhotoId === photo.id
                          ? "Deleting…"
                          : "Delete photo"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div style={{ ...styles.buttonRow, justifyContent: "center" }}>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("discover")}
          >
            <ArrowLeft size={17} />
            Back to Discover
          </button>
        </div>
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
{page === "profile" && renderProfile()}
      {page === "member" && renderMember()}
{page === "inbox" && renderInbox()}
{page === "conversation" && renderConversation()}

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
                  {currentUser && (
        <button
          type="button"
          style={styles.navButton}
          onClick={() => {
            navigate("profile");
            void loadMemberProfile();
          }}
        >
          <UserRound size={15} />
          My Profile
        </button>
      )}
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
