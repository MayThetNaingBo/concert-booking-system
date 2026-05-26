import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function StaffVerifyTicket() {
  const { id, secret } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const fetchTicket = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/verify/${id}/${secret}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid ticket");
        setTicket(null);
        return;
      }

      setError("");
      setTicket(data);
    } catch (err) {
      setError("Unable to verify ticket");
      setTicket(null);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id, secret]);

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login as admin first.");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/check-in/${id}/${secret}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Check-in failed");
        return;
      }

      alert("Ticket checked in successfully");
      fetchTicket();
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setCheckingIn(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString("en-SG");
  };

  const getStatusConfig = () => {
    if (error) {
      return {
        label: "INVALID",
        title: "ACCESS DENIED",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.35)",
        glow: "0 0 30px rgba(239,68,68,0.15)",
        icon: "✕",
        message: error,
      };
    }

    if (!ticket) {
      return {
        label: "VERIFYING",
        title: "SCANNING TICKET",
        color: "#38bdf8",
        bg: "rgba(56,189,248,0.10)",
        border: "1px solid rgba(56,189,248,0.28)",
        glow: "0 0 30px rgba(56,189,248,0.12)",
        icon: "…",
        message: "Please wait while the system verifies this ticket.",
      };
    }

    if (ticket.status === "VALID") {
      return {
        label: "VALID",
        title: "ACCESS APPROVED",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.35)",
        glow: "0 0 30px rgba(34,197,94,0.16)",
        icon: "✓",
        message: "This ticket is valid for entry.",
      };
    }

    if (ticket.status === "USED") {
      return {
        label: "USED",
        title: "ALREADY CHECKED IN",
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.35)",
        glow: "0 0 30px rgba(245,158,11,0.14)",
        icon: "!",
        message: "This ticket has already been used for entry.",
      };
    }

    return {
      label: "INVALID",
      title: "ACCESS DENIED",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.35)",
      glow: "0 0 30px rgba(239,68,68,0.15)",
      icon: "✕",
      message: "This ticket is not valid.",
    };
  };

  const status = getStatusConfig();

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.systemTitle}>CONCERTHUB GATE SCANNER</div>
            <div style={styles.systemSubTitle}>
              Entrance verification terminal
            </div>
          </div>

          <div style={styles.topRight}>
            <div style={styles.liveDot} />
            <span style={styles.onlineText}>ONLINE</span>
          </div>
        </div>

        <div
          style={{
            ...styles.panel,
            border: status.border,
            boxShadow: status.glow,
          }}
        >
          <div style={styles.statusSection}>
            <div
              style={{
                ...styles.statusIcon,
                color: status.color,
                border: `2px solid ${status.color}`,
                background: status.bg,
              }}
            >
              {status.icon}
            </div>

            <div style={styles.statusTextGroup}>
              <div
                style={{
                  ...styles.statusLabel,
                  color: status.color,
                }}
              >
                {status.label}
              </div>

              <h1 style={{ ...styles.statusHeading, color: status.color }}>
                {status.title}
              </h1>

              <p style={styles.statusMessage}>{status.message}</p>
            </div>
          </div>

          {!error && ticket && (
            <>
              <div style={styles.divider} />

              <div style={styles.eventBlock}>
                <div style={styles.eventEyebrow}>Event Information</div>
                <h2 style={styles.eventTitle}>
                  {ticket.concertName || "Concert"}
                </h2>
                <p style={styles.eventArtist}>{ticket.artist || "-"}</p>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Buyer Name</div>
                  <div style={styles.infoValue}>{ticket.buyerName || "-"}</div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Seat</div>
                  <div style={styles.infoValue}>
                    {ticket.seats?.join(", ") || "-"}
                  </div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Venue</div>
                  <div style={styles.infoValue}>{ticket.venue || "-"}</div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Date</div>
                  <div style={styles.infoValue}>{formatDate(ticket.date)}</div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Time</div>
                  <div style={styles.infoValue}>{ticket.startTime || "-"}</div>
                </div>

                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Booking ID</div>
                  <div style={styles.infoValueSmall}>
                    {ticket.bookingId || "-"}
                  </div>
                </div>
              </div>

              {ticket.buyerEmail && (
                <div style={styles.bottomRow}>
                  <span style={styles.bottomRowLabel}>Buyer Email</span>
                  <span style={styles.bottomRowValue}>{ticket.buyerEmail}</span>
                </div>
              )}

              {ticket.checkedInAt && (
                <div style={styles.bottomRow}>
                  <span style={styles.bottomRowLabel}>Checked In At</span>
                  <span style={styles.bottomRowValue}>
                    {formatDateTime(ticket.checkedInAt)}
                  </span>
                </div>
              )}

              {ticket.status === "VALID" && !isAdmin && (
                <div style={styles.noticeBox}>
                  Ticket is valid. Only admin/staff accounts can complete
                  check-in.
                </div>
              )}

              {ticket.status === "VALID" && isAdmin && (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  style={{
                    ...styles.checkInButton,
                    opacity: checkingIn ? 0.7 : 1,
                    cursor: checkingIn ? "not-allowed" : "pointer",
                  }}
                >
                  {checkingIn ? "CHECKING IN..." : "CHECK IN TICKET"}
                </button>
              )}

              {ticket.status === "USED" && (
                <div style={styles.usedNotice}>
                  This ticket has already been used. Do not allow entry again.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(34,197,94,0.06), transparent 20%), #050505",
    color: "white",
    padding: "30px 18px 50px",
    fontFamily: "Arial, sans-serif",
  },
  wrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    paddingTop: "90px",
  },
  topBar: {
    background: "#0d0d10",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "18px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
    flexWrap: "wrap",
    gap: "14px",
  },
  systemTitle: {
    fontSize: "18px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },
  systemSubTitle: {
    marginTop: "6px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.5)",
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  liveDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 12px rgba(34,197,94,0.8)",
  },
  onlineText: {
    fontSize: "12px",
    color: "#22c55e",
    fontWeight: "700",
    letterSpacing: "0.08em",
  },
  panel: {
    background: "linear-gradient(180deg, #17171b 0%, #111114 100%)",
    borderRadius: "22px",
    padding: "28px",
  },
  statusSection: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  statusIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    fontWeight: "800",
    flexShrink: 0,
  },
  statusTextGroup: {
    flex: 1,
    minWidth: "220px",
  },
  statusLabel: {
    fontSize: "13px",
    fontWeight: "800",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  statusHeading: {
    fontSize: "30px",
    fontWeight: "900",
    margin: "0 0 10px 0",
    letterSpacing: "0.02em",
  },
  statusMessage: {
    margin: 0,
    color: "rgba(255,255,255,0.72)",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  divider: {
    borderTop: "1px solid rgba(255,255,255,0.08)",
    margin: "24px 0",
  },
  eventBlock: {
    marginBottom: "20px",
  },
  eventEyebrow: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.48)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "8px",
    fontWeight: "700",
  },
  eventTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
  },
  eventArtist: {
    margin: "8px 0 0 0",
    color: "#fbbf24",
    fontSize: "16px",
    fontWeight: "700",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  infoCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    padding: "14px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: "700",
    marginBottom: "8px",
  },
  infoValue: {
    fontSize: "17px",
    fontWeight: "700",
    color: "white",
    lineHeight: 1.5,
  },
  infoValueSmall: {
    fontSize: "14px",
    fontWeight: "700",
    color: "white",
    lineHeight: 1.5,
    wordBreak: "break-all",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    flexWrap: "wrap",
  },
  bottomRowLabel: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "700",
  },
  bottomRowValue: {
    color: "white",
    fontWeight: "700",
  },
  noticeBox: {
    marginTop: "18px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "14px",
    color: "rgba(206, 58, 58, 0.79)",
    lineHeight: 1.6,
  },
  checkInButton: {
    marginTop: "20px",
    width: "100%",
    padding: "15px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#04110a",
    fontWeight: "900",
    fontSize: "15px",
    letterSpacing: "0.06em",
  },
  usedNotice: {
    marginTop: "18px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.28)",
    borderRadius: "12px",
    padding: "14px",
    color: "#fbbf24",
    fontWeight: "700",
    lineHeight: 1.6,
  },
};

export default StaffVerifyTicket;