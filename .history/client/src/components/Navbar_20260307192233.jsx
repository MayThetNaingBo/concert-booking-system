import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-black text-white px-10 py-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        ConcertHub
      </h1>

      <div className="space-x-6 text-sm">

        <Link to="/" className="hover:text-gray-300">
          Home
        </Link>

        <Link to="/my-bookings" className="hover:text-gray-300">
          My Bookings
        </Link>

        <Link to="/login" className="hover:text-gray-300">
          Login
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;