import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ConcertDetails from "./pages/ConcertDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import PaymentSuccess from "./pages/PaymentSuccess";


function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/concert/:id" element={<ConcertDetails />} />
        <Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/my-bookings" element={<MyBookings/>}/>
<Route path="/payment-success/:id" element={<PaymentSuccess/>}/>
      </Routes>
    </>
  );
}

export default App;