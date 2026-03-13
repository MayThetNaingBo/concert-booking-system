import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Bebas+Neue&display=swap');

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ticket-card {
    animation: fadeIn 0.5s ease forwards;
    max-width: 480px;
    margin: 0 auto;
    background: #1a1a1a;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    font-family: 'Inter', sans-serif;
  }

  .ticket-top {
    padding: 28px 28px 24px;
  }

  .ticket-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }

  .ticket-title {
    font-family: 'Bebas Neue', cursive;
    font-size: 18px;
    letter-spacing: 0.12em;
    color: #fff;
  }

  .ticket-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
  }

  .ticket-row:last-child { margin-bottom: 0; }

  .row-label {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }

  .row-value {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.6);
  }

  .divider-row {
    position: relative;
    display: flex;
    align-items: center;
  }

  .hole {
    width: 22px;
    height: 22px;
    background: #050508;
    border-radius: 50%;
    flex-shrink: 0;
    margin: 0 -11px;
    z-index: 1;
  }

  .dashed-line {
    flex: 1;
    border: none;
    border-top: 1.5px dashed rgba(255,255,255,0.1);
  }

  .ticket-stub {
    padding: 20px 28px;
    background: #161616;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .stub-text {
    font-family: 'Bebas Neue', cursive;
    font-size: 16px;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.4);
  }
`;

function Ticket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTicket(data);
    };
    fetchTicket();
  }, [id]);

  if (!ticket) return (
    <div style={{
      minHeight: "100vh", background: "#050508",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif", fontSize: "13px"
    }}>
      Loading ticket...
    </div>
  );

  const formattedDate = new Date(ticket.concert?.date).toLocaleDateString("en-SG", {
    day: "numeric", month: "numeric", year: "numeric"
  });

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: "100vh", background: "#050508",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div className="ticket-card">

          <div className="ticket-top">
            <div className="ticket-header">
              <span>🎟</span>
              <span className="ticket-title">Concert Ticket</span>
            </div>

            <div className="ticket-row">
              <span className="row-label">Name:</span>
              <span className="row-value">{ticket.user?.name}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Artist:</span>
              <span className="row-value">{ticket.concert?.artist}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Date:</span>
              <span className="row-value">{formattedDate}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Start Time:</span>
              <span className="row-value">{ticket.concert?.startTime}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Venue:</span>
              <span className="row-value">{ticket.concert?.venue}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Seats:</span>
              <span className="row-value">{ticket.seats?.join(", ")}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Total Paid:</span>
              <span className="row-value">SGD {ticket.totalPrice}</span>
            </div>
            <div className="ticket-row">
              <span className="row-label">Booking ID:</span>
              <span className="row-value" style={{ fontSize: "11.5px", wordBreak: "break-all" }}>
                {ticket._id}
              </span>
            </div>
          </div>

          {/* Tear perforation with punch holes */}
          <div className="divider-row">
            <div className="hole" />
            <hr className="dashed-line" />
            <div className="hole" />
          </div>

          {/* Entry Pass stub */}
          <div className="ticket-stub">
            <span className="stub-text">Entry Pass</span>
          </div>

        </div>
      </div>
    </>
  );
}

export default Ticket;
