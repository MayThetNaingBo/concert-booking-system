import { useNavigate, useParams } from "react-router-dom";

function PaymentSuccess() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div style={{ padding: "120px 30px", textAlign: "center", color: "white" }}>
      <h1>Payment Successful</h1>

      <p>
        Your payment was successful. Your ticket is being confirmed by Stripe.
      </p>

      <p>
        If your ticket does not appear immediately, wait a few seconds and check
        My Bookings again.
      </p>

      <button onClick={() => navigate(`/ticket/${id}`)}>
        View Ticket
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/my-bookings")}>
        Go to My Bookings
      </button>
    </div>
  );
}

export default PaymentSuccess;