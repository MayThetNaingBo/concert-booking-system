import { useEffect } from "react";
import { useParams } from "react-router-dom";

function PaymentSuccess() {

  const { id } = useParams();

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch(
      `http://localhost:5000/api/bookings/confirm/${id},
      {
        method: "POST",
        headers: {
          Authorization: Bearer ${token}
        }
      }
    );

  }, [id]);

  return (
    <div style={{padding:"100px", color:"white"}}>
      <h1>Payment Successful 🎉</h1>
    </div>
  );
}

export default PaymentSuccess;