import { Link } from "react-router-dom";
\

function Navbar() {

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
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

        .navbar-logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e8ff47;
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

        .navbar-cta {
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color:#050508;
          background:#e8ff47;
          padding:0.55rem 1.4rem;
          border-radius:2px;
          text-decoration:none;
          transition:background .2s, transform .1s;
        }

        .navbar-cta:hover {
          background:#f5ff8a;
          transform:translateY(-1px);
        }
      `}</style>

      <nav className="navbar">

        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-dot"></span>
          ConcertHub
        </Link>

        <ul className="navbar-links">

  <li>
    <Link to="/">Home</Link>
  </li>

  {token ? (
    <>
      <li>
        <Link to="/my-bookings">
          My Bookings
        </Link>
      </li>

      <li>
        <button
          onClick={handleLogout}
          className="navbar-cta"
        >
          Logout
        </button>
      </li>
    </>
  ) : (
    <>
      <li>
        <Link to="/login">
          Sign In
        </Link>
      </li>

      <li>
        <Link to="/register">
          Sign Up
        </Link>
      </li>
    </>
  )}

</ul>

      </nav>
    </>
  );
}

export default Navbar;