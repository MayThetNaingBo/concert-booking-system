import { useNavigate, useParams } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>✓</div>

        <h1 style={styles.title}>Payment Successful</h1>

        <p style={styles.subtitle}>
          Your payment has been completed successfully.
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Your ticket is being confirmed by Stripe. If it does not appear
            immediately, please wait a few seconds and check your bookings again.
          </p>
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.primaryButton} onClick={() => navigate(`/ticket/${id}`)}>
            View Ticket
          </button>

          <button style={styles.secondaryButton} onClick={() => navigate("/my-bookings")}>
            Go to My Bookings
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(180deg, #111111 0%, #050505 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    color: "white",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#1f1f22",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "42px 34px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.45)",
  },

  iconCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#22c55e",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "38px",
    fontWeight: "bold",
    margin: "0 auto 24px",
  },

  title: {
    fontSize: "30px",
    marginBottom: "10px",
    letterSpacing: "1px",
  },

  subtitle: {
    fontSize: "16px",
    color: "#d4d4d8",
    marginBottom: "24px",
  },

  infoBox: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "28px",
  },

  infoText: {
    margin: 0,
    color: "#c7c7c7",
    lineHeight: "1.6",
    fontSize: "14px",
  },

  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  primaryButton: {
    padding: "14px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#f5b301",
    color: "#111",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    letterSpacing: "0.5px",
  },

  secondaryButton: {
    padding: "14px 18px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "10px",
    background: "transparent",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    letterSpacing: "0.5px",
  },
};

export default PaymentSuccess;