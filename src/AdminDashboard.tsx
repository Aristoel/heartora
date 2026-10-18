import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowLeft,
  Users,
  UserRound,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Heart,
  LogOut,
} from "lucide-react";

type AdminDashboardProps = {
  onBack: () => void;
  onSignout: () => void;
};

type DashboardStats = {
  totalMembers?: number;
  totalUsers?: number;
  newMembers?: number;
  newUsers?: number;
  activeSubscriptions?: number;
  premiumMembers?: number;
  subscriptions?: number;
};

type Member = {
  id?: string;
  email?: string;
  displayName?: string;
  country?: string;
  createdAt?: string;
  created_at?: string;
  emailVerified?: boolean | number;
  email_verified?: boolean | number;
};

type ApiResult = {
  success?: boolean;
  error?: string;
  stats?: DashboardStats;
  members?: Member[];
  users?: Member[];
  total?: number;
  totalMembers?: number;
  totalUsers?: number;
  [key: string]: unknown;
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#fff8fc",
    color: "#352438",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #f0e1eb",
    padding: "16px 20px",
  },
  headerInner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #ead6e4",
    background: "#ffffff",
    color: "#82265d",
    padding: "10px 14px",
    borderRadius: 11,
    fontWeight: 700,
    cursor: "pointer",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "30px 20px 60px",
  },
  heading: {
    margin: "0 0 8px",
    fontSize: "clamp(27px, 5vw, 38px)",
    letterSpacing: "-1.2px",
  },
  muted: {
    color: "#786779",
    lineHeight: 1.7,
    fontSize: 14,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
    gap: 16,
    marginTop: 25,
  },
  card: {
    background: "#ffffff",
    border: "1px solid #f0e2eb",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 7px 24px rgba(70, 30, 60, 0.035)",
    minWidth: 0,
  },
  icon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    background: "#fae9f3",
    color: "#922c68",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  number: {
    fontSize: 32,
    fontWeight: 850,
    letterSpacing: "-1px",
    margin: "8px 0",
    overflowWrap: "anywhere",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    marginTop: 18,
  },
  table: {
    width: "100%",
    minWidth: 650,
    borderCollapse: "collapse",
    textAlign: "left",
  },
  cell: {
    padding: "13px 12px",
    borderBottom: "1px solid #f0e5ed",
    fontSize: 13,
    verticalAlign: "top",
  },
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    border: "1px solid #f0cccc",
    background: "#fff0f0",
    color: "#982d3c",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    lineHeight: 1.6,
    fontSize: 14,
  },
};

async function adminRequest(path: string): Promise<ApiResult> {
  const response = await fetch(path, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as
    | ApiResult
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        (response.status === 401
          ? "Please sign in to continue."
          : response.status === 403
            ? "Your account is not authorized to access the admin dashboard."
            : "Unable to load admin information."),
    );
  }

  return result;
}

function formatDate(value?: string): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard({
  onBack,
  onSignout,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [statsResult, membersResult] = await Promise.all([
        adminRequest("/api/admin/stats"),
        adminRequest("/api/admin/members"),
      ]);

      const statsData =
        statsResult.stats ??
        (statsResult.data as DashboardStats | undefined) ??
        statsResult;

      const memberList =
        membersResult.members ??
        membersResult.users ??
        (Array.isArray(membersResult.data)
          ? (membersResult.data as Member[])
          : []);

      setStats(statsData);
      setMembers(memberList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the admin dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totalMembers =
    stats?.totalMembers ?? stats?.totalUsers ?? members.length;

  const newMembers = stats?.newMembers ?? stats?.newUsers;

  const activeSubscriptions =
    stats?.activeSubscriptions ??
    stats?.premiumMembers ??
    stats?.subscriptions;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#82265d",
              fontSize: 21,
              fontWeight: 850,
            }}
          >
            <Heart size={25} fill="currentColor" />
            Heartora Admin
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button type="button" style={styles.button} onClick={onBack}>
              <ArrowLeft size={16} />
              Back to website
            </button>

            <button type="button" style={styles.button} onClick={onSignout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                color: "#82265d",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: ".6px",
              }}
            >
              <ShieldCheck size={16} />
              PRIVATE ADMINISTRATION
            </div>

            <h1 style={{ ...styles.heading, marginTop: 12 }}>
              Dashboard overview
            </h1>

            <p style={styles.muted}>
              Monitor Heartora membership and Premium subscription statistics.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.button,
              opacity: refreshing ? 0.65 : 1,
            }}
            disabled={loading || refreshing}
            onClick={() => void loadDashboard(true)}
          >
            <RefreshCw
              size={16}
              style={{
                animation: refreshing ? "heartora-spin 1s linear infinite" : "none",
              }}
            />
            {refreshing ? "Refreshing…" : "Refresh data"}
          </button>
        </div>

        {error && (
          <div role="alert" style={styles.notice}>
            <AlertCircle size={19} />
            <div>
              <strong>Dashboard information unavailable</strong>
              <div>{error}</div>
              <p style={{ margin: "8px 0 0" }}>
                The dashboard is connected to the existing admin API. If
                access is denied, confirm that you are signed in with the
                authorized administrator account.
              </p>
            </div>
          </div>
        )}

        <div style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.icon}>
              <Users size={22} />
            </div>
            <div style={styles.muted}>Registered members</div>
            <div style={styles.number}>
              {loading ? "…" : totalMembers ?? "—"}
            </div>
            <div style={styles.muted}>Total accounts reported by the API</div>
          </article>

          <article style={styles.card}>
            <div style={styles.icon}>
              <UserRound size={22} />
            </div>
            <div style={styles.muted}>New members</div>
            <div style={styles.number}>
              {loading ? "…" : newMembers ?? "—"}
            </div>
            <div style={styles.muted}>
              Registration count reported by the API
            </div>
          </article>

          <article style={styles.card}>
            <div style={styles.icon}>
              <CreditCard size={22} />
            </div>
            <div style={styles.muted}>Premium subscriptions</div>
            <div style={styles.number}>
              {loading ? "…" : activeSubscriptions ?? "—"}
            </div>
            <div style={styles.muted}>
              Subscription count reported by the API
            </div>
          </article>
        </div>

        <section style={{ ...styles.card, marginTop: 25 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Registered members</h2>
          <p style={styles.muted}>
            Member information returned by the protected admin endpoint.
          </p>

          {loading ? (
            <p style={styles.muted}>Loading member records…</p>
          ) : members.length === 0 ? (
            <p style={styles.muted}>
              No member records were returned. This may mean the account list
              is empty or the API uses a different response format.
            </p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Display name", "Email", "Country", "Joined"].map(
                      (heading) => (
                        <th
                          key={heading}
                          style={{
                            ...styles.cell,
                            color: "#7d2459",
                            background: "#fff8fc",
                          }}
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.id ?? member.email ?? index}>
                      <td style={styles.cell}>
                        {member.displayName ?? "—"}
                      </td>
                      <td style={styles.cell}>{member.email ?? "—"}</td>
                      <td style={styles.cell}>{member.country ?? "—"}</td>
                      <td style={styles.cell}>
                        {formatDate(member.createdAt ?? member.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p
          style={{
            ...styles.muted,
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 24,
          }}
        >
          <ShieldCheck size={16} />
          Access must be authorized by the Cloudflare Worker, not just by this
          page.
        </p>
      </main>
    </div>
  );
  }
