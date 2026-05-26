import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://concert-booking-api.onrender.com/api/bookings/confirm/${id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          navigate(`/ticket/${id}`);
        } else {
          setError(data.message || "Payment confirmed, but ticket could not be loaded.");
        }
      } catch (err) {
        setError("Something went wrong while confirming your payment.");
      }
    };

    confirmPayment();
  }, [id, navigate]);

  return (
    <div style={{ padding: "120px 30px", color: "black", textAlign: "center" }}>
      {!error ? (
        <h2>Processing payment...</h2>
      ) : (
        <>
          <h2>Payment confirmation problem</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/my-bookings")}>
            Go to My Bookings
          </button>
        </>
      )}
    </div>
  );
}

export default PaymentSuccess;