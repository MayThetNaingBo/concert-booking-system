import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PaymentSuccess() {
  const { id } = useParams();
  const [message, setMessage] = useState("Processing payment...");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/bookings/confirm/${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}
            }
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Payment could not be confirmed.");
          return;
        }

        setMessage("Payment successful 🎉 Booking confirmed.");
      } catch (error) {
        setMessage("Something went wrong while confirming payment.");
      }
    };

    confirmPayment();
  }, [id]);

  return (
    <div style={{ padding: "100px", color: "white", background: "#050508", minHeight: "100vh" }}>
      <h1>{message}</h1>
    </div>
  );
}

export default PaymentSuccess;