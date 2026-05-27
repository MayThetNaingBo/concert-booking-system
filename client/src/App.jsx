import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import ConcertDetails from "./pages/ConcertDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import PaymentSuccess from "./pages/PaymentSuccess";
import Ticket from "./pages/Ticket";
import VerifyTicket from "./pages/VerifyTicket";
import StaffVerifyTicket from "./pages/StaffVerifyTicket";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/AccountSettings";
import MyTickets from "./pages/MyTickets";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/concert/:id" element={<ConcertDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/account-settings" element={<AccountSettings />} />

        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment-success/:id" element={<PaymentSuccess />} />
        <Route path="/ticket/:id" element={<Ticket />} />
<Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/verify-ticket/:id/:secret" element={<VerifyTicket />} />
        <Route
          path="/staff/verify-ticket/:id/:secret"
          element={<StaffVerifyTicket />}
        />
      </Routes>
    </>
  );
}

export default App;