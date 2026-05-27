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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;500;600;700;800;900&display=swap');

        .navbar {
          height: 70px;
          background: #0b0b0d;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 36px;
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .navbar-logo img {
          width: 42px;
          height: 42px;
          object-fit: cover;
        }

        .navbar-logo span {
          font-family: 'Bebas Neue', sans-serif;
          color: white;
          font-weight: 900;
          letter-spacing: 0.18em;
          font-size: 28px;
          line-height: 1;
          transition: color 0.2s;
        }

        .navbar-logo:hover span {
          color: #e8ff47;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          list-style: none;
        }

        .navbar-links a,
        .navbar-dropdown-button {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .navbar-links a:hover,
        .navbar-dropdown-button:hover {
          color: #fff;
        }

        .navbar-links a::after,
        .navbar-dropdown-button::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: #e8ff47;
          transition: width .3s;
        }

        .navbar-links a:hover::after,
        .navbar-dropdown-button:hover::after {
          width: 100%;
        }

        .profile-wrapper {
          position: relative;
        }

        .avatar-button {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.18);
          background: linear-gradient(135deg, #facc15, #f59e0b);
          color: #111;
          font-weight: 900;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .avatar-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 18px rgba(232,255,71,0.25);
        }

        .dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 250px;
          background: #18181b;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.45);
          padding: 12px;
          z-index: 2000;
        }

        .user-info {
          padding: 10px 10px 12px;
        }

        .user-name {
  color: white;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
}

.user-email {
  color: rgba(255,255,255,0.5);
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  margin-top: 4px;
  word-break: break-all;
}

.role-badge {
  display: inline-block;
  margin-top: 10px;
  background: rgba(232,255,71,0.08);
  border: 1px solid rgba(232,255,71,0.45);
  color: #e8ff47;
  border-radius: 999px;
  padding: 4px 9px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

        .dropdown-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 6px 0;
        }

        .dropdown-item,
.logout-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 11px 10px;
  border-radius: 0;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  transition: color 0.2s;
}

.dropdown-item {
  color: rgba(255,255,255,0.6);
}

.dropdown-item:hover {
  color: #fff;
  background: transparent;
}

.dropdown-item::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 10px;
  width: 0;
  height: 1px;
  background: #e8ff47;
  transition: width 0.3s;
}

.dropdown-item:hover::after {
  width: calc(100% - 20px);
}

.logout-item {
  color: #f87171;
}

.logout-item:hover {
  color: #ff9b9b;
  background: transparent;
}

.logout-item::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 10px;
  width: 0;
  height: 1px;
  background: #f87171;
  transition: width 0.3s;
}

.logout-item:hover::after {
  width: calc(100% - 20px);
}
        @media (max-width: 640px) {
          .navbar {
            padding: 0 18px;
          }

          .navbar-logo span {
            font-size: 22px;
            letter-spacing: 0.14em;
          }

          .navbar-links {
            gap: 1.2rem;
          }

          .navbar-links a {
            font-size: 0.72rem;
          }
        }
      `}</style>

      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="ConcertHub Logo" />
          <span>CONCERTHUB</span>
        </Link>

        <div className="navbar-links">
          <Link to="/">HOME</Link>

          {token ? (
            <>
              <Link to="/my-bookings">MY BOOKINGS</Link>

              <div className="profile-wrapper">
                <button
                  onClick={() => setOpen(!open)}
                  className="avatar-button"
                >
                  {avatarLetter}
                </button>

                {open && (
                  <div className="dropdown">
                    <div className="user-info">
                      <div className="user-name">{user?.name || "User"}</div>
                      <div className="user-email">{user?.email || ""}</div>

                      {user?.role && (
                        <div className="role-badge">{user.role}</div>
                      )}
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile");
                      }}
                    >
                      My Profile
                    </button>

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setOpen(false);
                        navigate("/account-settings");
                      }}
                    >
                      Account Settings
                    </button>

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setOpen(false);
                        navigate("/my-tickets");
                      }}
                    >
                      My Tickets
                    </button>

                    <button className="logout-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">SIGN IN</Link>
              <Link to="/register">SIGN UP</Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;