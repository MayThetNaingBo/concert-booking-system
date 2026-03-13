import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      const newToken = localStorage.getItem("token");
      const prevToken = token;
      setToken(newToken);
      // Show success toast when logging in (token goes from null to having a value)
      if (!prevToken && newToken) {
        setShowLoginToast(true);
        setTimeout(() => setShowLoginToast(false), 3500);
      }
    };

    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authChanged"));
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(5, 5, 8, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 2.5rem;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.75rem;
          letter-spacing: 0.12em;
          color: #fff;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-logo-img {
          width: 43px;
          height: 43px;
          object-fit: contain;
        }

        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          list-style: none;
        }

        .navbar-links a {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          transition: color 0.2s;
          position: relative;
        }

        .navbar-links a:hover {
          color: #fff;
        }

        .navbar-links a::after {
          content:'';
          position:absolute;
          bottom:-4px;
          left:0;
          width:0;
          height:1px;
          background:#e8ff47;
          transition:width .3s;
        }

        .navbar-links a:hover::after {
          width:100%;
        }

        /* ── Login Success Toast ── */
        .login-toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 9999;
          background: rgba(10, 10, 14, 0.95);
          border: 1px solid rgba(232, 255, 71, 0.35);
          border-radius: 12px;
          padding: 1rem 1.4rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          box-shadow: 0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,255,71,0.08);
          animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          min-width: 240px;
        }

        .login-toast.hiding {
          animation: toastSlideOut 0.35s ease-in forwards;
        }

        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes toastSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(12px) scale(0.95); }
        }

        .toast-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(232, 255, 71, 0.12);
          border: 1px solid rgba(232, 255, 71, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }

        .toast-text {
          font-family: 'Outfit', sans-serif;
        }

        .toast-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
        }

        .toast-sub {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.45);
          margin-top: 2px;
        }

        .toast-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          background: #e8ff47;
          border-radius: 0 0 12px 12px;
          animation: toastBar 3.5s linear forwards;
        }

        @keyframes toastBar {
          from { width: 100%; }
          to   { width: 0%; }
        }

        /* ── Logout Confirmation Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .modal-box {
          background: rgba(12, 12, 16, 0.98);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 2rem 2.2rem;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.7);
          animation: modalPop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          text-align: center;
        }

        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.9) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 80, 80, 0.1);
          border: 1px solid rgba(255, 80, 80, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin: 0 auto 1.2rem;
        }

        .modal-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.1em;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .modal-desc {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
          margin-bottom: 1.8rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-cancel {
          flex: 1;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.7);
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }

        .btn-logout-confirm {
          flex: 1;
          padding: 0.7rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 80, 80, 0.4);
          background: rgba(255, 80, 80, 0.15);
          color: #ff6b6b;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-logout-confirm:hover {
          background: rgba(255, 80, 80, 0.28);
          color: #ff8f8f;
          border-color: rgba(255, 80, 80, 0.6);
        }
      `}</style>

      <nav className="navbar">
        <Link to="/" className="navbar-logo">
          <img src="/src/assets/logo.png" alt="ConcertHub Logo" className="navbar-logo-img" />
          ConcertHub
        </Link>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>

          {token ? (
            <>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setShowLogoutModal(true); }}
                >
                  Logout
                </a>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Sign Up</Link></li>
            </>
          )}
        </ul>
      </nav>

      {/* ── Login Success Toast ── */}
      {showLoginToast && (
        <div className="login-toast">
          <div className="toast-icon">✓</div>
          <div className="toast-text">
            <div className="toast-title">Login Successful</div>
            <div className="toast-sub">Welcome back to ConcertHub</div>
          </div>
          <div className="toast-bar" />
        </div>
      )}

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          
            <div className="modal-title">Leaving Already?</div>
            <p className="modal-desc">
              Are you sure you want to log out?<br />Your session will end.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn-logout-confirm" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
