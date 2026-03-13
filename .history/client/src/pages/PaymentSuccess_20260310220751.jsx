import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function PaymentSuccess() {

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {

    const confirmPayment = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        http://localhost:5000/api/bookings/confirm/${id},
        {
          method:"POST",
          headers:{
            Authorization:`Bearer ${token}`
          }
        }
      );

      if (res.ok) {
        navigate(`/ticket/${id}`);
      }

    };

    confirmPayment();

  }, [id]);

  return <p style={{color:"white"}}>Processing payment...</p>;

}

export default PaymentSuccess;