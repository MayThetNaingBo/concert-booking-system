import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AccountSettings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    ticketReminders: true,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        window.dispatchEvent(new Event("authChanged"));

        const savedPreferences = localStorage.getItem("preferences");

        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
      } catch (error) {
        setMessage("Unable to load account settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [navigate]);

  const handlePreferenceChange = (key) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(updatedPreferences);
    localStorage.setItem("preferences", JSON.stringify(updatedPreferences));
    setMessage("Preferences updated successfully.");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to change password.");
        return;
      }

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage("Something went wrong while changing password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.card}>
            <h2>Loading account settings...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>ConcertHub Account</p>
          <h1 style={styles.title}>Account Settings</h1>
          <p style={styles.subtitle}>
            Manage your profile, security, preferences, and login session.
          </p>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Profile Information</h2>
            <p style={styles.sectionText}>
              Basic account details connected to your ConcertHub profile.
            </p>
          </div>

          <div style={styles.profileArea}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div>
              <h3 style={styles.profileName}>{user?.name || "User"}</h3>
              <p style={styles.profileEmail}>{user?.email || "-"}</p>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <span style={styles.label}>Name</span>
              <strong style={styles.value}>{user?.name || "-"}</strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Email</span>
              <strong style={styles.value}>{user?.email || "-"}</strong>
            </div>

            <div style={styles.infoBox}>
              <span style={styles.label}>Role</span>
              <strong style={styles.roleBadge}>{user?.role || "user"}</strong>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Security</h2>
            <p style={styles.sectionText}>
              Change your password to keep your account secure.
            </p>
          </div>

          <form onSubmit={handlePasswordChange} style={styles.form}>
            <input
              type="password"
              placeholder="Current password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  currentPassword: e.target.value,
                })
              }
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="New password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  newPassword: e.target.value,
                })
              }
              style={styles.input}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: e.target.value,
                })
              }
              style={styles.input}
              required
            />

            <button type="submit" style={styles.primaryButton}>
              Change Password
            </button>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Preferences</h2>
            <p style={styles.sectionText}>
              Choose how ConcertHub should notify you about your tickets.
            </p>
          </div>

          <div style={styles.preferenceRow}>
            <div>
              <strong>Email notifications</strong>
              <p style={styles.preferenceText}>
                Receive booking updates and ticket information by email.
              </p>
            </div>

            <button
              onClick={() => handlePreferenceChange("emailNotifications")}
              style={{
                ...styles.toggle,
                background: preferences.emailNotifications
                  ? "#22c55e"
                  : "#3f3f46",
              }}
            >
              {preferences.emailNotifications ? "ON" : "OFF"}
            </button>
          </div>

          <div style={styles.preferenceRow}>
            <div>
              <strong>Ticket reminders</strong>
              <p style={styles.preferenceText}>
                Get reminders before your upcoming concert.
              </p>
            </div>

            <button
              onClick={() => handlePreferenceChange("ticketReminders")}
              style={{
                ...styles.toggle,
                background: preferences.ticketReminders
                  ? "#22c55e"
                  : "#3f3f46",
              }}
            >
              {preferences.ticketReminders ? "ON" : "OFF"}
            </button>
          </div>
        </section>

        <section style={styles.logoutCard}>
          <div>
            <h2 style={styles.sectionTitle}>Logout</h2>
            <p style={styles.sectionText}>
              Sign out from this browser session.
            </p>
          </div>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(232,160,32,0.08), transparent 28%), #050508",
    color: "white",
    padding: "110px 22px 50px",
    fontFamily: "Inter, sans-serif",
  },

  container: {
    maxWidth: "920px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#e8a020",
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: "12px",
    fontWeight: "900",
    marginBottom: "8px",
  },

  title: {
    fontSize: "40px",
    margin: 0,
    fontWeight: "900",
    letterSpacing: "-0.02em",
  },

  subtitle: {
    color: "rgba(255,255,255,0.62)",
    marginTop: "10px",
    lineHeight: "1.6",
  },

  message: {
    background: "rgba(232,160,32,0.12)",
    border: "1px solid rgba(232,160,32,0.32)",
    color: "#fbbf24",
    padding: "14px 16px",
    borderRadius: "12px",
    marginBottom: "18px",
    fontWeight: "700",
  },

  card: {
    background: "linear-gradient(180deg, #1c1c1f, #151518)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "24px",
    marginBottom: "18px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
  },

  sectionHeader: {
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "850",
  },

  sectionText: {
    color: "rgba(255,255,255,0.6)",
    marginTop: "6px",
    lineHeight: "1.6",
  },

  profileArea: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "900",
  },

  profileName: {
    margin: 0,
    fontSize: "22px",
  },

  profileEmail: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.55)",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  infoBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "14px",
    padding: "16px",
  },

  label: {
    display: "block",
    color: "rgba(255,255,255,0.45)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "8px",
    fontWeight: "800",
  },

  value: {
    fontSize: "17px",
  },

  roleBadge: {
    display: "inline-block",
    background: "rgba(232,160,32,0.14)",
    color: "#fbbf24",
    border: "1px solid rgba(232,160,32,0.35)",
    padding: "6px 10px",
    borderRadius: "999px",
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.08em",
  },

  form: {
    display: "grid",
    gap: "12px",
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none",
  },

  primaryButton: {
    marginTop: "4px",
    padding: "14px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#e8a020",
    color: "#111",
    fontWeight: "900",
    cursor: "pointer",
  },

  preferenceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    padding: "16px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  preferenceText: {
    color: "rgba(255,255,255,0.58)",
    margin: "6px 0 0",
    lineHeight: "1.5",
  },

  toggle: {
    border: "none",
    minWidth: "70px",
    padding: "9px 12px",
    borderRadius: "999px",
    color: "white",
    fontWeight: "900",
    cursor: "pointer",
  },

  logoutCard: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "18px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  logoutButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default AccountSettings;