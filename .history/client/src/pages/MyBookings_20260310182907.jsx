import { useEffect, useState } from "react";

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/bookings/myBookings", {
        headers: {
          Authorization: `Bearer ${token}
        }
      });

      const data = await res.json();
      setBookings(data);
    } catch (error) {
      alert("Failed to load bookings");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: Bearer ${token}
        }
      });

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

      const res = await fetch(`http://localhost:5000/api/bookings/confirm/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: Bearer ${token}
        }
      });

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
    <div style={{ minHeight: "100vh", background: "#050508", color: "white", padding: "100px 40px 40px" }}>
      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "2.5rem",
        letterSpacing: "0.08em",
        marginBottom: "24px"
      }}>
        My Bookings
      </h1>

      {bookings.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.6)" }}>No bookings yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px",
                padding: "20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                  {booking.concert?.artist || "Concert"}
                </h2>

                <span style={{
                  background: getStatusColor(booking.status),
                  color: "#000",
                  fontWeight: "700",
                  fontSize: "0.75rem",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  textTransform: "uppercase"
                }}>
                  {booking.status}
                </span>
              </div>

              <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.8)" }}>
                Venue: {booking.concert?.venue || "-"}
              </p>

              <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.8)" }}>
                Seats: {booking.seats.join(", ")}
              </p>

              <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.8)" }}>
                Total: SGD {booking.totalPrice}
              </p>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                {booking.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleConfirm(booking._id)}
                      style={{
                        background: "#e8ff47",
                        color: "#050508",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      Proceed to Payment
                    </button>

                    <button
                      onClick={() => handleCancel(booking._id)}
                      style={{
                        background: "transparent",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                {booking.status === "confirmed" && (
                  <span style={{ color: "#22c55e", fontWeight: "600" }}>
                    Payment completed
                  </span>
                )}

                {booking.status === "cancelled" && (
                  <span style={{ color: "#ef4444", fontWeight: "600" }}>
                    Booking cancelled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;