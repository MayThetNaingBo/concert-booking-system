import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
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
          alert(data.message || "Failed to load tickets.");
          return;
        }

        const confirmedTickets = Array.isArray(data)
          ? data.filter((booking) => booking.status === "confirmed")
          : [];

        setTickets(confirmedTickets);
      } catch (error) {
        alert("Something went wrong while loading your tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>My Tickets</h1>
          <p style={styles.muted}>Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>ConcertHub</p>
            <h1 style={styles.title}>My Tickets</h1>
            <p style={styles.subtitle}>
              Your confirmed concert tickets are shown here.
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div style={styles.emptyBox}>
            <h2 style={styles.emptyTitle}>No tickets yet</h2>
            <p style={styles.muted}>
              Your successful purchases will appear here.
            </p>
            <button style={styles.browseButton} onClick={() => navigate("/")}>
              Browse Concerts
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {tickets.map((ticket) => {
              const concert = ticket.concert;

              const formattedDate = concert?.date
                ? new Date(concert.date).toLocaleDateString("en-SG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "-";

              return (
                <div key={ticket._id} style={styles.ticketRow}>
                  <div style={styles.mainInfo}>
                    <div style={styles.status}>CONFIRMED</div>

                    <h2 style={styles.concertTitle}>
                      {concert?.title || "Concert"}
                    </h2>

                    <p style={styles.details}>
                      {concert?.artist || "-"} · {formattedDate} ·{" "}
                      {concert?.startTime || "-"}
                    </p>

                    <p style={styles.venue}>{concert?.venue || "-"}</p>
                  </div>

                  <div style={styles.ticketInfo}>
                    <div>
                      <span style={styles.label}>Seats</span>
                      <strong style={styles.value}>
                        {ticket.seats?.join(", ") || "-"}
                      </strong>
                    </div>

                    <div>
                      <span style={styles.label}>Total Paid</span>
                      <strong style={styles.value}>SGD {ticket.totalPrice}</strong>
                    </div>

                    <button
                      style={styles.viewButton}
                      onClick={() => navigate(`/ticket/${ticket._id}`)}
                    >
                      View Ticket
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#050508",
    color: "white",
    padding: "110px 24px 50px",
    fontFamily: "Outfit, sans-serif",
  },

  container: {
    maxWidth: "960px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#e8ff47",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: "12px",
    fontWeight: "800",
    marginBottom: "8px",
  },

  title: {
    fontSize: "36px",
    margin: 0,
    fontWeight: "900",
  },

  subtitle: {
    color: "rgba(255,255,255,0.58)",
    marginTop: "8px",
    lineHeight: "1.6",
  },

  muted: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: "1.6",
  },

  list: {
    display: "grid",
    gap: "14px",
  },

  ticketRow: {
    background: "#18181b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  mainInfo: {
    flex: "1 1 320px",
  },

  status: {
    color: "#e8ff47",
    fontSize: "11px",
    fontWeight: "900",
    letterSpacing: "0.14em",
    marginBottom: "8px",
  },

  concertTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "850",
  },

  details: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.72)",
    fontSize: "14px",
  },

  venue: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.45)",
    fontSize: "13px",
  },

  ticketInfo: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
  },

  label: {
    display: "block",
    color: "rgba(255,255,255,0.42)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "5px",
    fontWeight: "800",
  },

  value: {
    color: "white",
    fontSize: "14px",
  },

  viewButton: {
    padding: "11px 16px",
    borderRadius: "9px",
    border: "none",
    background: "#e8ff47",
    color: "#050508",
    fontWeight: "900",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
  },

  emptyBox: {
    background: "#18181b",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "30px",
    textAlign: "center",
  },

  emptyTitle: {
    margin: "0 0 8px",
  },

  browseButton: {
    marginTop: "18px",
    padding: "12px 18px",
    borderRadius: "9px",
    border: "none",
    background: "#e8ff47",
    color: "#050508",
    fontWeight: "900",
    cursor: "pointer",
  },
};

export default MyTickets;