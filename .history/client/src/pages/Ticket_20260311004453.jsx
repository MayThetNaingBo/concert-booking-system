import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QR } from "qrcode.react";

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
    max-width: 640px;
    background: #1c1c1e;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 28px 70px rgba(0,0,0,0.8);
    overflow: hidden;
  }

  .ticket-accent {
    height: 5px;
    background: linear-gradient(90deg, #c8860a, #f0c040, #c8860a);
  }

  .ticket-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 30px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-title {
    font-family: 'Bebas Neue', cursive;
    font-size: 19px;
    letter-spacing: 0.15em;
    color: #fff;
  }

  .header-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #e8a020;
    border: 1px solid rgba(232,160,32,0.45);
    border-radius: 4px;
    padding: 4px 10px;
    text-transform: uppercase;
  }

  .artist-hero {
    padding: 24px 30px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
  }

  .artist-info { flex: 1; }

  .artist-eyebrow {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: #e8a020;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .artist-name {
    font-family: 'Bebas Neue', cursive;
    font-size: 58px;
    line-height: 1;
    letter-spacing: 0.04em;
    color: #fff;
  }

  .concert-sub {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    margin-top: 6px;
  }

  .artist-meta {
    text-align: right;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
    padding-bottom: 4px;
  }

  .meta-pill {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px;
    padding: 6px 14px;
    text-align: center;
  }

  .meta-pill-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    display: block;
    margin-bottom: 2px;
  }

  .meta-pill-value {
    font-family: 'Bebas Neue', cursive;
    font-size: 20px;
    letter-spacing: 0.06em;
    color: #fff;
  }

  .ticket-body {
    padding: 22px 30px;
    display: flex;
    gap: 24px;
  }

  .fields {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .field-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    white-space: nowrap;
    min-width: 88px;
  }

  .field-value {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.75);
  }

  .seat-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-left: 24px;
    border-left: 1px solid rgba(255,255,255,0.07);
    min-width: 100px;
    gap: 10px;
  }

  .seat-label {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.22em;
    color: rgba(255,255,255,0.28);
    text-transform: uppercase;
  }

  .seat-number {
    font-family: 'Bebas Neue', cursive;
    font-size: 62px;
    color: #f0c040;
  }

  .price-block {
    font-size: 9px;
    font-weight: 600;
    color: rgba(255,255,255,0.28);
    border-top: 1px solid rgba(255,255,255,0.07);
    padding-top: 10px;
    text-align: center;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .price-amount {
    font-family: 'Bebas Neue', cursive;
    font-size: 24px;
    color: #fff;
  }

  .perf {
    display: flex;
    align-items: center;
    height: 1px;
  }

  .perf-hole {
    width: 24px;
    height: 24px;
    background: #0a0a0a;
    border-radius: 50%;
    margin: 0 -12px;
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
    padding: 18px 30px;
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
  }

  .stub-title {
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

      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      setTicket(data);

    };

    fetchTicket();

  }, [id]);

  if (!ticket) return <div className="page">Loading ticket...</div>;

  const formattedDate = new Date(ticket.concert?.date).toLocaleDateString("en-SG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

          <div className="artist-hero">

            <div className="artist-info">
              <div className="artist-eyebrow">Live Performance · World Tour 2026</div>
              <div className="artist-name">{ticket.concert?.artist}</div>
              <div className="concert-sub">{ticket.concert?.venue}</div>
            </div>

            <div className="artist-meta">
              <div className="meta-pill">
                <span className="meta-pill-label">Date</span>
                <span className="meta-pill-value">{formattedDate}</span>
              </div>

              <div className="meta-pill">
                <span className="meta-pill-label">Starting Time</span>
                <span className="meta-pill-value">{ticket.concert?.startTime}</span>
              </div>
            </div>

          </div>

          <div className="ticket-body">

            <div className="fields">
              <div className="field-row">
                <span className="field-label">Name</span>
                <span className="field-value">{ticket.user?.name}</span>
              </div>

              <div className="field-row">
                <span className="field-label">Booking ID</span>
                <span className="field-value">{ticket._id}</span>
              </div>
            </div>

            <div className="seat-col">
              <span className="seat-label">Seat</span>
              <span className="seat-number">{ticket.seats?.join(", ")}</span>

              <div className="price-block">
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

            <QRCode
              value={`${window.location.origin}/ticket/${ticket._id}`}
              size={90}
              bgColor="#ffffff"
              fgColor="#000000"
            />

          </div>

        </div>

      </div>
    </>
  );
}

export default Ticket;