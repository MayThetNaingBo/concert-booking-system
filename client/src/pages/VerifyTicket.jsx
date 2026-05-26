import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function VerifyTicket() {
  const { id, secret } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/bookings/verify/${id}/${secret}`
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Invalid ticket");
          return;
        }

        setTicket(data);
      } catch (err) {
        setError("Unable to verify ticket");
      }
    };

    verifyTicket();
  }, [id, secret]);

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.invalid}>INVALID TICKET</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2>Verifying ticket...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={ticket.checkedIn ? styles.used : styles.valid}>
          {ticket.checkedIn ? "ALREADY USED" : "VALID TICKET"}
        </h1>

        <p><strong>Concert:</strong> {ticket.concertName}</p>
        <p><strong>Artist:</strong> {ticket.artist}</p>
        <p><strong>Venue:</strong> {ticket.venue}</p>
        <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString("en-SG")}</p>
        <p><strong>Time:</strong> {ticket.startTime}</p>
        <p><strong>Seat:</strong> {ticket.seats?.join(", ")}</p>
        <p><strong>Booking ID:</strong> {ticket.bookingId}</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
    color: "white"
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#1c1c1e",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    padding: "28px",
    lineHeight: "1.8"
  },
  valid: {
    color: "#22c55e",
    marginBottom: "20px"
  },
  invalid: {
    color: "#ef4444",
    marginBottom: "20px"
  },
  used: {
    color: "#f59e0b",
    marginBottom: "20px"
  }
};

export default VerifyTicket;