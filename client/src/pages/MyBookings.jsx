import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please sign in again to view your bookings.");
        setBookings([]);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/myBookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data);
        setError(data.message || "Failed to load bookings.");
        setBookings([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Invalid response:", data);
        setError("Invalid bookings response from server.");
        setBookings([]);
        return;
      }

      setBookings(data);
    } catch (error) {
      console.error(error);
      setError("Failed to load bookings.");
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const updated = {};

      bookings.forEach((booking) => {
        if (booking.status === "pending" && booking.expiresAt) {
          const diff = new Date(booking.expiresAt) - now;

          if (diff > 0) {
            const seconds = Math.floor(diff / 1000);
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;

            updated[booking._id] = `${mins}:${secs
              .toString()
              .padStart(2, "0")}`;
          } else {
            updated[booking._id] = "expired";
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
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handlePayment = async (booking) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payment/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: booking._id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Payment failed");
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      alert("Payment error");
    }
  };

  const handleLogoutAndLogin = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "#facc15";
    if (status === "confirmed") return "#22c55e";
    if (status === "cancelled") return "#ef4444";
    if (status === "refunded") return "#60a5fa";
    return "#9ca3af";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050508",
        color: "white",
        padding: "100px 40px 40px",
      }}
    >
      <h1
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "2.5rem",
          letterSpacing: "0.08em",
          marginBottom: "24px",
        }}
      >
        My Bookings
      </h1>

      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: "12px",
            padding: "18px",
            marginBottom: "24px",
            color: "#fecaca",
            maxWidth: "650px",
          }}
        >
          <strong>{error}</strong>

          <p
            style={{
              marginTop: "8px",
              color: "rgba(255,255,255,0.72)",
              lineHeight: "1.6",
            }}
          >
            Your login session may have expired. Please sign in again and try
            again.
          </p>

          <button
            onClick={handleLogoutAndLogin}
            style={{
              marginTop: "14px",
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Sign In Again
          </button>
        </div>
      )}

      {!error && bookings.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.6)" }}>No bookings yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {Array.isArray(bookings) &&
            bookings.map((booking) => (
              <div
                key={booking._id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "14px",
                    gap: "12px",
                  }}
                >
                  <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
                    {booking.concert?.artist ||
                      booking.concert?.title ||
                      "Concert"}
                  </h2>

                  <span
                    style={{
                      background: getStatusColor(booking.status),
                      color: "#000",
                      fontWeight: "700",
                      fontSize: "0.75rem",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.8)" }}>
                  Venue: {booking.concert?.venue || "-"}
                </p>

                <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.8)" }}>
                  Seats: {booking.seats?.join(", ") || "-"}
                </p>

                <p style={{ margin: "6px 0", color: "rgba(255,255,255,0.8)" }}>
                  Total: SGD {booking.totalPrice ?? "-"}
                </p>

                {booking.status === "pending" && (
                  <p style={{ color: "#facc15" }}>
                    Seat reserved for {timeLeft[booking._id] || "calculating..."}
                  </p>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handlePayment(booking)}
                        disabled={timeLeft[booking._id] === "expired"}
                        style={{
                          background:
                            timeLeft[booking._id] === "expired"
                              ? "#737373"
                              : "#e8ff47",
                          color: "#050508",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          cursor:
                            timeLeft[booking._id] === "expired"
                              ? "not-allowed"
                              : "pointer",
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
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => navigate(`/ticket/${booking._id}`)}
                      style={{
                        background: "#22c55e",
                        color: "#000",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      View Ticket
                    </button>
                  )}

                  {booking.status === "cancelled" && (
                    <span style={{ color: "#ef4444", fontWeight: "600" }}>
                      Booking cancelled
                    </span>
                  )}

                  {booking.status === "refunded" && (
                    <span style={{ color: "#60a5fa", fontWeight: "600" }}>
                      Booking refunded
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