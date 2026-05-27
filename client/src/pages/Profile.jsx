import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
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
          setError(data.message || "Failed to load profile.");
          return;
        }

        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));

        window.dispatchEvent(new Event("authChanged"));
      } catch (error) {
        setError("Something went wrong while loading your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSignInAgain = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Unable to load profile</h2>

          <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.6" }}>
            {error}
          </p>

          <button onClick={handleSignInAgain} style={styles.button}>
            Sign In Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <h1 style={styles.title}>My Profile</h1>

        <div style={styles.row}>
          <span style={styles.label}>Name</span>
          <span style={styles.value}>{user?.name || "-"}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Email</span>
          <span style={styles.value}>{user?.email || "-"}</span>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Role</span>
          <span style={styles.roleBadge}>{user?.role || "user"}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050508",
    color: "white",
    padding: "120px 24px 40px",
    display: "flex",
    justifyContent: "center",
  },

  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#1c1c1e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "34px",
    boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
  },

  avatar: {
    width: "78px",
    height: "78px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    fontWeight: "900",
    marginBottom: "20px",
  },

  title: {
    marginBottom: "24px",
    fontSize: "28px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "16px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },

  label: {
    color: "rgba(255,255,255,0.5)",
    fontWeight: "700",
  },

  value: {
    color: "white",
    fontWeight: "700",
    textAlign: "right",
  },

  roleBadge: {
    background: "rgba(250,204,21,0.12)",
    border: "1px solid rgba(250,204,21,0.3)",
    color: "#facc15",
    fontWeight: "800",
    textTransform: "uppercase",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    letterSpacing: "0.08em",
  },

  button: {
    marginTop: "18px",
    background: "#facc15",
    color: "#111",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default Profile;