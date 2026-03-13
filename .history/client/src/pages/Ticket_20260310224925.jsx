import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap');

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    font-family: 'Inter', sans-serif;
  }

  .ticket {
    animation: fadeIn 0.5s ease forwards;
    width: 100%;
    max-width: 520px;
    background: #1c1c1e;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 20px 60px rgba(0,0,0,0.7);
    overflow: hidden;
  }

  .ticket-accent {
    height: 5px;
    background: linear-gradient(90deg, #e8a020, #f0c040, #e8a020);
  }

  .ticket-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-title {
    font-family: 'Bebas Neue', cursive;
    font-size: 17px;
    letter-spacing: 0.15em;
    color: #fff;
  }

  .header-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    color: #e8a020;
    border: 1px solid rgba(232,160,32,0.4);
    border-radius: 4px;
    padding: 3px 8px;
    text-transform: uppercase;
  }

  .ticket-body {
    padding: 22px 24px;
    display: flex;
    gap: 20px;
  }

  .fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  .field-row {
    display: flex;
    align-items: baseline;
    gap: 7px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    white-space: nowrap;
    min-width: 80px;
  }

  .field-value {
    font-size: 12.5px;
    font-weight: 400;
    color: rgba(255,255,255,0.55);
    line-height: 1.4;
    word-break: break-all;
  }

  .seat-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-left: 20px;
    border-left: 1px solid rgba(255,255,255,0.07);
    min-width: 90px;
  }

  .seat-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
  }

  .seat-number {
    font-family: 'Bebas Neue', cursive;
    font-size: 52px;
    line-height: 1;
    color: #f0c040;
    letter-spacing: 0.04em;
  }

  .price-tag {
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.35);
    border-top: 1px solid rgba(255,255,255,0.08);
    padding-top: 8px;
    text-align: center;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .price-amount {
    font-family: 'Bebas Neue', cursive;
    font-size: 20px;
    color: #fff;
    letter-spacing: 0.05em;
    display: block;
    margin-top: 2px;
  }

  .perf {
    position: relative;
    display: flex;
    align-items: center;
    height: 1px;
  }

  .perf-hole {
    width: 22px;
    height: 22px;
    background: #0a0a0a;
    border-radius: 50%;
    flex-shrink: 0;
    margin: 0 -11px;
    z-index: 1;
  }

  .perf-line {
    flex: 1;
    border: none;
    border-top: 1.5px dashed rgba(255,255,255,0.1);
  }

  .ticket-stub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: #161618;
  }

  .stub-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stub-dot {
    width: 8px;
    height: 8px;
    background: #e8a020;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .stub-title {
    font-family: 'Bebas Neue', cursive;
    font-size: 15px;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.45);
  }

  .bar {
    background: rgba(255,255,255,0.18);
    border-radius: 2px;
  }
`;

function Barcode({ id = "" }) {
  const bars = Array.from({ length: 34 }, (_, i) => {
    const c = id.charCodeAt(i % (id.length || 1)) || 60;
    return { w: ((c + i * 5) % 2) + 1, h: 10 + ((c + i * 11) % 18) };
  });
  return (
    <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "28px" }}>
      {bars.map((b, i) => (
        <div key={i} className="bar" style={{ width: b.w, height: b.h }} />
      ))}
    </div>
  );
}

function Ticket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTicket(data);
    };
    fetchTicket();
  }, [id]);

  if (!ticket) return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.25)", fontFamily: "Inter, sans-serif", fontSize: "13px",
    }}>
      Loading ticket...
    </div>
  );

  const formattedDate = new Date(ticket.concert?.date).toLocaleDateString("en-SG", {
    day: "numeric", month: "numeric", year: "numeric",
  });

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <div className="ticket">

          <div className="ticket-accent" />

          <div className="ticket-header">
            <div className="header-left">
              <span>🎟</span>
              <span className="header-title">Concert Ticket</span>
            </div>
            <span className="header-badge">Official</span>
          </div>

          <div className="ticket-body">
            <div className="fields">
              <div className="field-row">
                <span className="field-label">Name</span>
                <span className="field-value">{ticket.user?.name}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Artist</span>
                <span className="field-value">{ticket.concert?.artist}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Date</span>
                <span className="field-value">{formattedDate}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Start Time</span>
                <span className="field-value">{ticket.concert?.startTime}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Venue</span>
                <span className="field-value">{ticket.concert?.venue}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Booking ID</span>
                <span className="field-value" style={{ fontSize: "11px" }}>{ticket._id}</span>
              </div>
            </div>

            <div className="seat-col">
              <span className="seat-label">Seat</span>
              <span className="seat-number">{ticket.seats?.join(", ")}</span>
              <div className="price-tag">
                Total Paid
                <span className="price-amount">SGD {ticket.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="perf">
            <div className="perf-hole" />
            <hr className="perf-line" />
            <div className="perf-hole" />
          </div>

          <div className="ticket-stub">
            <div className="stub-left">
              <div className="stub-dot" />
              <span className="stub-title">Entry Pass</span>
            </div>
            <Barcode id={ticket._id} />
          </div>

        </div>
      </div>
    </>
  );
}

export default Ticket;
