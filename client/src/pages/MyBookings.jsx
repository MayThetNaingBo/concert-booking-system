import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [error, setError] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
  });

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
        setPopup({
          show: true,
          title: "Cancel Failed",
          message: data.message || "Unable to cancel this booking.",
        });
        return;
      }

      setPopup({
        show: true,
        title: "Booking Cancelled",
        message: "Your booking has been cancelled successfully.",
      });

      fetchBookings();
    } catch (error) {
      setPopup({
        show: true,
        title: "Cancel Error",
        message: "Something went wrong while cancelling your booking.",
      });
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

  const closePopup = () => {
    setPopup({
      show: false,
      title: "",
      message: "",
    });
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "#facc15";
    if (status === "confirmed") return "#22c55e";
    if (status === "cancelled") return "#ef4444";
    if (status === "refunded") return "#60a5fa";
    return "#9ca3af";
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>My Bookings</h1>

      {error && (
        <div style={styles.errorBox}>
          <strong>{error}</strong>

          <p style={styles.errorText}>
            Your login session may have expired. Please sign in again and try
            again.
          </p>

          <button onClick={handleLogoutAndLogin} style={styles.signInButton}>
            Sign In Again
          </button>
        </div>
      )}

      {!error && bookings.length === 0 ? (
        <p style={styles.emptyText}>No bookings yet.</p>
      ) : (
        <div style={styles.bookingGrid}>
          {Array.isArray(bookings) &&
            bookings.map((booking) => (
              <div key={booking._id} style={styles.bookingCard}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.concertTitle}>
                    {booking.concert?.artist ||
                      booking.concert?.title ||
                      "Concert"}
                  </h2>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background: getStatusColor(booking.status),
                    }}
                  >
                    {booking.status}
                  </span>
                </div>

                <p style={styles.infoText}>
                  Venue: {booking.concert?.venue || "-"}
                </p>

                <p style={styles.infoText}>
                  Seats: {booking.seats?.join(", ") || "-"}
                </p>

                <p style={styles.infoText}>
                  Total: SGD {booking.totalPrice ?? "-"}
                </p>

                {booking.status === "pending" && (
                  <p style={styles.pendingText}>
                    Seat reserved for{" "}
                    {timeLeft[booking._id] || "calculating..."}
                  </p>
                )}

                <div style={styles.actionRow}>
                  {booking.status === "pending" && (
                    <>
                      <button
                        onClick={() => handlePayment(booking)}
                        disabled={timeLeft[booking._id] === "expired"}
                        style={{
                          ...styles.paymentButton,
                          background:
                            timeLeft[booking._id] === "expired"
                              ? "#737373"
                              : "#e8ff47",
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
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => navigate(`/ticket/${booking._id}`)}
                      style={styles.viewTicketButton}
                    >
                      View Ticket
                    </button>
                  )}

                  {booking.status === "cancelled" && (
                    <span style={styles.cancelledText}>
                      Booking cancelled
                    </span>
                  )}

                  {booking.status === "refunded" && (
                    <span style={styles.refundedText}>Booking refunded</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {popup.show && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <div style={styles.popupIcon}>✓</div>

            <h2 style={styles.popupTitle}>{popup.title}</h2>

            <p style={styles.popupText}>{popup.message}</p>

            <button style={styles.popupButton} onClick={closePopup}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050508",
    color: "white",
    padding: "100px 40px 40px",
  },

  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: "2.5rem",
    letterSpacing: "0.08em",
    marginBottom: "24px",
  },

  errorBox: {
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "24px",
    color: "#fecaca",
    maxWidth: "650px",
  },

  errorText: {
    marginTop: "8px",
    color: "rgba(255,255,255,0.72)",
    lineHeight: "1.6",
  },

  signInButton: {
    marginTop: "14px",
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },

  emptyText: {
    color: "rgba(255,255,255,0.6)",
  },

  bookingGrid: {
    display: "grid",
    gap: "20px",
  },

  bookingCard: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "20px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    gap: "12px",
  },

  concertTitle: {
    fontSize: "1.2rem",
    margin: 0,
  },

  statusBadge: {
    color: "#000",
    fontWeight: "700",
    fontSize: "0.75rem",
    padding: "6px 10px",
    borderRadius: "999px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  infoText: {
    margin: "6px 0",
    color: "rgba(255,255,255,0.8)",
  },

  pendingText: {
    color: "#facc15",
  },

  actionRow: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    flexWrap: "wrap",
  },

  paymentButton: {
    color: "#050508",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "700",
  },

  cancelButton: {
    background: "#ef4444",
    color: "#050508",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },

  viewTicketButton: {
    background: "#e8ff47",
    color: "#000",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
  },

  cancelledText: {
    color: "#ef4444",
    fontWeight: "600",
  },

  refundedText: {
    color: "#60a5fa",
    fontWeight: "600",
  },

  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.72)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },

  popup: {
    width: "100%",
    maxWidth: "420px",
    background: "#18181b",
    border: "1px solid rgba(232,255,71,0.2)",
    borderRadius: "18px",
    padding: "28px",
    color: "white",
    boxShadow: "0 30px 80px rgba(0,0,0,0.65)",
    textAlign: "center",
  },

  popupIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "#e8ff47",
    color: "#050508",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "28px",
    fontWeight: "900",
  },

  popupTitle: {
    fontSize: "26px",
    marginBottom: "10px",
    color: "#e8ff47",
  },

  popupText: {
    color: "rgba(255,255,255,0.72)",
    lineHeight: 1.6,
    marginBottom: "24px",
  },

  popupButton: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#e8ff47",
    color: "#050508",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default MyBookings;