import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

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
    padding: 80px 20px 40px;
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

  .artist-title {
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
    padding: 12px 30px;
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

  .message-card {
    width: 100%;
    max-width: 430px;
    background: #1c1c1e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 32px;
    text-align: center;
    color: white;
    box-shadow: 0 28px 70px rgba(0,0,0,0.8);
    animation: fadeIn 0.5s ease forwards;
  }

  .message-title {
    font-size: 24px;
    margin-bottom: 12px;
  }

  .message-text {
    color: rgba(255,255,255,0.65);
    line-height: 1.6;
    margin-bottom: 22px;
  }

  .refresh-btn {
    padding: 12px 18px;
    border-radius: 8px;
    border: none;
    background: #e8a020;
    color: #111;
    font-weight: 700;
    cursor: pointer;
  }
`;

function Ticket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/bookings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load ticket.");
          return;
        }

        setTicket(data);
      } catch (err) {
        setError("Something went wrong while loading your ticket.");
      }
    };

    fetchTicket();
  }, [id]);

  if (error) {
    return (
      <>
        <style>{styles}</style>

        <div className="page">
          <div className="message-card">
            <h2 className="message-title">Unable to Load Ticket</h2>

            <p className="message-text">{error}</p>

            <button className="refresh-btn" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <style>{styles}</style>

        <div className="page">
          <div className="message-card">
            <h2 className="message-title">Loading ticket...</h2>

            <p className="message-text">
              Please wait while we load your ticket details.
            </p>
          </div>
        </div>
      </>
    );
  }

  const isTicketReady =
    ticket.status === "confirmed" &&
    ticket.qrSecret &&
    ticket.concert &&
    ticket.concert.title &&
    ticket.concert.date &&
    ticket.concert.startTime &&
    ticket.seats &&
    ticket.seats.length > 0 &&
    ticket.totalPrice !== undefined &&
    ticket.totalPrice !== null;

  if (!isTicketReady) {
    return (
      <>
        <style>{styles}</style>

        <div className="page">
          <div className="message-card">
            <h2 className="message-title">Preparing your ticket...</h2>

            <p className="message-text">
              Your payment was successful. We are preparing your ticket now.
              This usually takes a few seconds.
            </p>

            <button className="refresh-btn" onClick={() => window.location.reload()}>
              Refresh Ticket
            </button>
          </div>
        </div>
      </>
    );
  }

  const formattedDate = new Date(ticket.concert.date).toLocaleDateString("en-SG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
const qrLink = `${window.location.origin}/staff/verify-ticket/${ticket._id}/${ticket.qrSecret}`;
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
              <div className="artist-eyebrow">
                Live Performance · World Tour 2026
              </div>

              <div className="artist-title">{ticket.concert.title}</div>

              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#e8a020",
                  letterSpacing: "0.08em",
                  marginTop: "6px",
                }}
              >
                {ticket.concert.artist}
              </div>

              <div className="concert-sub">{ticket.concert.venue}</div>
            </div>

            <div className="artist-meta">
              <div className="meta-pill">
                <span className="meta-pill-label">Date</span>
                <span className="meta-pill-value">{formattedDate}</span>
              </div>

              <div className="meta-pill">
                <span className="meta-pill-label">Starting Time</span>
                <span className="meta-pill-value">
                  {ticket.concert.startTime}
                </span>
              </div>
            </div>
          </div>

          <div className="ticket-body">
            <div className="fields">
              <div className="field-row">
                <span className="field-label">Name</span>
                <span className="field-value">
                  {ticket.user?.name || "Customer"}
                </span>
              </div>

              <div className="field-row">
                <span className="field-label">Booking ID</span>
                <span className="field-value">{ticket._id}</span>
              </div>
            </div>

            <div className="seat-col">
              <span className="seat-label">Seat</span>
              <span className="seat-number">{ticket.seats.join(", ")}</span>

              <div className="price-block">
                Total Paid

                <div style={{ marginTop: "4px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#e8a020",
                      letterSpacing: "0.15em",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    SGD{" "}
                  </span>

                  <span className="price-amount">{ticket.totalPrice}</span>
                </div>
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

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
  <QRCodeSVG
    value={qrLink}
    size={72}
    bgColor="#ffffff"
    fgColor="#000000"
  />

  <button
    onClick={() => navigator.clipboard.writeText(qrLink)}
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: 200,
      color: "whitesmoke",
    }}
  >
    Copy QR Link
  </button>
</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Ticket;