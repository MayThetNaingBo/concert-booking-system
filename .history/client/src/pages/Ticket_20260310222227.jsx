import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Ticket() {

  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {

    const fetchTicket = async () => {

      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      setTicket(data);

    };

    fetchTicket();

  }, [id]);

  if (!ticket) return <p style={{color:"white"}}>Loading ticket...</p>;

  return (

    <div style={{
      minHeight:"100vh",
      background:"#050508",
      color:"white",
      padding:"100px 40px"
    }}>

      <div style={{
        maxWidth:"500px",
        margin:"auto",
        background:"rgba(255,255,255,0.05)",
        border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:"16px",
        padding:"30px"
      }}>

        <h1 style={{
          fontFamily:"'Bebas Neue'",
          letterSpacing:"0.1em"
        }}>
          🎟 Concert Ticket
        </h1>

        <hr style={{opacity:0.2}} />

        <p><b>Name:</b> {ticket.user?.name}</p>
        <p><b>Artist:</b> {ticket.concert?.artist}</p>
        <p>
<b>Date:</b> {new Date(ticket.concert?.date).toLocaleDateString()}
</p>
        <p><b>Start Time:</b>{ticket.concert?.startTime}</p>
        <p><b>Venue:</b> {ticket.concert?.venue}</p>
        <p><b>Seats:</b> {ticket.seats.join(", ")}</p>
        <p><b>Total Paid:</b> SGD {ticket.totalPrice}</p>
        <p><b>Booking ID:</b> {ticket._id}</p>

        <div style={{
          marginTop:"30px",
          padding:"20px",
          border:"1px dashed rgba(255,255,255,0.3)",
          textAlign:"center"
        }}>
          Entry Pass
        </div>

      </div>

    </div>

  );

}

export default Ticket;