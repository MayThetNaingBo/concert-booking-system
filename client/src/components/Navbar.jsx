import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const fetchCurrentUser = async () => {
    try {
      const currentToken = localStorage.getItem("token");

      setToken(currentToken);

      if (!currentToken) {
        setUser(null);
        return;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to fetch current user:", data);
        return;
      }

      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthChanged = () => {
      fetchCurrentUser();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener("authChanged", handleAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setOpen(false);

    window.dispatchEvent(new Event("authChanged"));

    navigate("/login");
  };

  const avatarLetter = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.logoBox}>
        <img src="/logo.png" alt="ConcertHub Logo" style={styles.logoImg} />
        <span style={styles.logoText}>CONCERTHUB</span>
      </Link>

      <div style={styles.navLinks}>
        <Link to="/" style={styles.navLink}>
          HOME
        </Link>

        {token ? (
          <>
            <Link to="/my-bookings" style={styles.navLink}>
              MY BOOKINGS
            </Link>

            <div style={styles.profileWrapper}>
              <button
                onClick={() => setOpen(!open)}
                style={styles.avatarButton}
              >
                {avatarLetter}
              </button>

              {open && (
                <div style={styles.dropdown}>
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user?.name || "User"}</div>
                    <div style={styles.userEmail}>{user?.email || ""}</div>

                    {user?.role && (
                      <div style={styles.roleBadge}>{user.role}</div>
                    )}
                  </div>

                  <div style={styles.divider} />

                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                  >
                    My Profile
                  </button>

                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setOpen(false);
                      navigate("/account-settings");
                    }}
                  >
                    Account Settings
                  </button>

                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setOpen(false);
                      navigate("/my-bookings");
                    }}
                  >
                    My Bookings
                  </button>

                  <button style={styles.logoutItem} onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.navLink}>
              SIGN IN
            </Link>

            <Link to="/register" style={styles.navLink}>
              SIGN UP
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    height: "70px",
    background: "#0b0b0d",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 36px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },

  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
  },

  logoImg: {
    width: "42px",
    height: "42px",
    objectFit: "cover",
  },

  logoText: {
    color: "white",
    fontWeight: "900",
    letterSpacing: "0.14em",
    fontSize: "22px",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
  },

  navLink: {
    color: "rgba(255,255,255,0.72)",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.1em",
  },

  profileWrapper: {
    position: "relative",
  },

  avatarButton: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "linear-gradient(135deg, #facc15, #f59e0b)",
    color: "#111",
    fontWeight: "900",
    fontSize: "15px",
    cursor: "pointer",
  },

  dropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    width: "250px",
    background: "#18181b",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
    padding: "12px",
    zIndex: 2000,
  },

  userInfo: {
    padding: "10px 10px 12px",
  },

  userName: {
    color: "white",
    fontWeight: "800",
    fontSize: "14px",
    marginBottom: "4px",
  },

  userEmail: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
    wordBreak: "break-all",
  },

  roleBadge: {
    display: "inline-block",
    marginTop: "8px",
    background: "rgba(250,204,21,0.12)",
    border: "1px solid rgba(250,204,21,0.3)",
    color: "#facc15",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "10px",
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.08)",
    margin: "6px 0",
  },

  dropdownItem: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    color: "rgba(255,255,255,0.78)",
    border: "none",
    padding: "11px 10px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },

  logoutItem: {
    width: "100%",
    textAlign: "left",
    background: "transparent",
    color: "#f87171",
    border: "none",
    padding: "11px 10px",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
  },
};

export default Navbar;