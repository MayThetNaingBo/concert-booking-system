import { useEffect, useState } from "react";

function MyBookings() {

  const [bookings, setBookings] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  const fetchBookings = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/bookings/myBookings",
        {
          headers: {
            Authorization: Bearer ${token}
          }
        }
      );

      const data = await res.json();
      setBookings(data);

    } catch (error) {

      alert("Failed to load bookings");

    }

  };

  useEffect(() => {
    fetchBookings();
  }, []);


  // countdown timer
  useEffect(() => {

    const interval = setInterval(() => {

      const now = new Date();
      const updated = {};

      bookings.forEach(b => {

        if (b.status === "pending" && b.expiresAt) {

          const diff = new Date(b.expiresAt) - now;

          if (diff > 0) {

            const seconds = Math.floor(diff / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;

            updated[b._id] =
              ${mins}:${secs.toString().padStart(2,"0")};

          } else {

            updated[b._id] = "expired";

          }

        }

      });

      setTimeLeft(updated);

    }, 1000);

    return () => clearInterval(interval);

  }, [bookings]);


  const handleCancel = async (bookingId) => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        http://localhost:5000/api/bookings/${bookingId},
        {
          method: "DELETE",
          headers: {
            Authorization: Bearer ${token}
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Cancel failed");
        return;
      }

      alert("Booking cancelled");
      fetchBookings();

    } catch (error) {

      alert("Cancel error");

    }

  };


  const handleConfirm = async (bookingId) => {

    try {

      const token = localStorage.getItem("token");

      const res = await fetch(
        http://localhost:5000/api/bookings/confirm/${bookingId},
        {
          method: "POST",
          headers: {
            Authorization: Bearer ${token}
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Payment failed");
        return;
      }

      alert("Payment successful");
      fetchBookings();

    } catch (error) {

      alert("Payment error");

    }

  };


  const getStatusColor = (status) => {

    if (status === "pending") return "#facc15";
    if (status === "confirmed") return "#22c55e";
    if (status === "cancelled") return "#ef4444";

    return "#9ca3af";

  };


  return (

    <div style={{
      minHeight:"100vh",
      background:"#050508",
      color:"white",
      padding:"100px 40px 40px"
    }}>

      <h1 style={{
        fontFamily:"'Bebas Neue', sans-serif",
        fontSize:"2.5rem",
        letterSpacing:"0.08em",
        marginBottom:"24px"
      }}>
        My Bookings
      </h1>


      {bookings.length === 0 ? (

        <p style={{color:"rgba(255,255,255,0.6)"}}>
          No bookings yet.
        </p>

      ) : (

        <div style={{display:"grid", gap:"20px"}}>

          {bookings.map((booking) => (

            <div
              key={booking._id}
              style={{
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:"14px",
                padding:"20px"
              }}
            >

              <div style={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                marginBottom:"14px"
              }}>

                <h2 style={{fontSize:"1.2rem", margin:0}}>
                  {booking.concert?.artist || "Concert"}
                </h2>

                <span style={{
                  background:getStatusColor(booking.status),