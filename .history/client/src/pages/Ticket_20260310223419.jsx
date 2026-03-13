import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Space+Mono:wght@400;700&family=Bebas+Neue&display=swap');

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes holoPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }

  .ticket-wrapper {
    animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .ticket-container {
    position: relative;
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    filter: drop-shadow(0 40px 80px rgba(0,0,0,0.8)) drop-shadow(0 0 40px rgba(255,200,50,0.08));
  }

  .ticket-main {
    background: linear-gradient(135deg, #1a1208 0%, #0d0d0d 40%, #1a0d0a 100%);
    border-radius: 16px 16px 0 0;
    padding: 36px 36px 28px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255,200,80,0.15);
    border-bottom: none;
  }

  .ticket-main::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(ellipse at 20% 50%, rgba(255,180,0,0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(255,100,50,0.05) 0%, transparent 50%);
    pointer-events: none;
  }

  .holo-strip {
    position: absolute;
    top: 0; right: 40px;
    width: 28px;
    height: 100%;
    background: linear-gradient(
      180deg,
      #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff6b6b
    );
    background-size: 100% 300%;
    animation: shimmer 3s linear infinite;
    opacity: 0.15;
    filter: blur(1px);
  }

  .holo-strip::after {
    content: '';
    position: absolute;
    inset: 0;
    background: inherit;
    animation: holoPulse 2s ease-in-out infinite;
    mix-blend-mode: screen;
  }

  .event-label {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.3em;
    color: rgba(255,200,80,0.6);
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .artist-name {
    font-family: 'Bebas Neue', cursive;
    font-size: 72px;
    line-height: 0.9;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, #fff9e6 0%, #ffd970 50%, #ff9a3c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .concert-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 13px;
    letter-spacing: 0.25em;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    margin-bottom: 28px;
  }

  .divider-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,200,80,0.3), rgba(255,200,80,0.3), transparent);
    margin: 24px 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 24px;
    margin-bottom: 24px;
  }

  .info-block {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .info-block.full-width {
    grid-column: 1 / -1;
  }

  .info-label {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.25em;
    color: rgba(255,200,80,0.5);
    text-transform: uppercase;
  }

  .info-value {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.02em;
    line-height: 1.1;
  }

  .info-value.large {
    font-size: 22px;
  }

  .seat-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(255,200,80,0.2), rgba(255,150,30,0.1));
    border: 1px solid rgba(255,200,80,0.35);
    border-radius: 6px;
    padding: 4px 14px;
    font-family: 'Bebas Neue', cursive;
    font-size: 28px;
    letter-spacing: 0.08em;
    color: #ffd970;
  }

  /* TEAR PERFORATION */
  .tear-edge {
    position: relative;
    height: 20px;
    background: transparent;
    display: flex;
    align-items: center;
  }

  .tear-dots {
    width: 100%;
    height: 2px;
    background-image: repeating-linear-gradient(
      90deg,
      rgba(255,200,80,0.25) 0px,
      rgba(255,200,80,0.25) 8px,
      transparent 8px,
      transparent 16px
    );
    position: relative;
  }

  .tear-circle-left {
    position: absolute;
    left: -18px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    background: #050508;
    border-radius: 50%;
    border: 1px solid rgba(255,200,80,0.1);
    z-index: 2;
  }

  .tear-circle-right {
    position: absolute;
    right: -18px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    background: #050508;
    border-radius: 50%;
    border: 1px solid rgba(255,200,80,0.1);
    z-index: 2;
  }

  /* STUB */
  .ticket-stub {
    background: linear-gradient(135deg, #110e04 0%, #0a0a0a 100%);
    border-radius: 0 0 16px 16px;
    padding: 24px 36px 28px;
    border: 1px solid rgba(255,200,80,0.15);
    border-top: none;
    display: flex;
    align-items: center;
    gap: 20px;
    position: relative;
    overflow: hidden;
  }

  .ticket-stub::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(255,200,80,0.015) 2px,
      rgba(255,200,80,0.015) 4px
    );
  }

  .barcode-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .barcode {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    height: 52px;
  }

  .bar {
    background: rgba(255,255,255,0.85);
    border-radius: 1px;
  }

  .barcode-num {
    font-family: 'Space Mono', monospace;
    font-size: 7px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.05em;
  }

  .stub-divider {
    width: 1px;
    height: 60px;
    background: linear-gradient(180deg, transparent, rgba(255,200,80,0.25), transparent);
    flex-shrink: 0;
  }

  .entry-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .entry-pass-label {
    font-family: 'Space Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.25em;
    color: rgba(255,200,80,0.5);
    text-transform: uppercase;
  }

  .entry-pass-text {
    font-family: 'Bebas Neue', cursive;
    font-size: 26px;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.9);
    line-height: 1;
  }

  .booking-id {
    font-family: 'Space Mono', monospace;
    font-size: 7.5px;
    color: rgba(255,255,255,0.25);
    margin-top: 4px;
    word-break: break-all;
    line-height: 1.5;
  }

  .scan-icon {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .qr-mock {
    width: 44px;
    height: 44px;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(7, 1fr);
    gap: 1.5px;
    opacity: 0.6;
  }

  .qr-cell {
    border-radius: 1px;
  }

  .scan-label {
    font-family: 'Space Mono', monospace;
    font-size: 6px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .scanline-container {
    position: relative;
    overflow: hidden;
  }

  .scanline {
    position: absolute;
    left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255,200,80,0.6), transparent);
    animation: scanline 2.5s ease-in-out infinite;
    pointer-events: none;
  }
`;

// Deterministic barcode from booking ID
function generateBars(seed) {
  const bars = [];
  for (let i = 0; i < 42; i++) {
    const char = seed?.charCodeAt(i % (seed?.length || 1)) || 50;
    const w = ((char + i * 7) % 3) + 1;
    const h = 30 + ((char + i * 13) % 22);
    bars.push({ w, h });
  }
  return bars;
}

// Mini QR-style pattern
const QR_PATTERN = [
  [1,1,1,1,1,1,0,],
  [1,0,0,0,0,1,0,],
  [1,0,1,1,0,1,1,],
  [1,0,1,1,0,1,0,],
  [1,0,0,0,0,1,1,],
  [1,1,1,1,1,1,0,],
  [0,1,0,1,0,0,1,],
];

function QRMock() {
  return (
    <div className="qr-mock">
      {QR_PATTERN.flat().map((cell, i) => (
        <div
          key={i}
          className="qr-cell"
          style={{ background: cell ? 'rgba(255,220,100,0.9)' : 'transparent' }}
        />
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
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTicket(data);
    };
    fetchTicket();
  }, [id]);

  if (!ticket) return (
    <div style={{
      minHeight: "100vh",
      background: "#050508",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Space Mono', monospace",
      color: "rgba(255,200,80,0.5)",
      fontSize: "11px",
      letterSpacing: "0.2em"
    }}>
      LOADING TICKET...
    </div>
  );

  const bars = generateBars(ticket._id);
  const shortId = ticket._id?.slice(-12).toUpperCase();

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: "100vh",
        background: "#050508",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(255,180,30,0.04) 0%, transparent 60%)",
        padding: "80px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div className="ticket-wrapper" style={{ width: "100%", maxWidth: "480px" }}>

          {/* Venue header above ticket */}
          <div style={{
            textAlign: "center",
            marginBottom: "20px",
            fontFamily: "'Space Mono', monospace",
            fontSize: "9px",
            letterSpacing: "0.3em",
            color: "rgba(255,200,80,0.35)",
            textTransform: "uppercase"
          }}>
            ◆ &nbsp; Official Entry Pass &nbsp; ◆
          </div>

          <div className="ticket-container">

            {/* MAIN BODY */}
            <div className="ticket-main">
              <div className="holo-strip" />

              <div className="event-label">Live Concert Experience</div>
              <div className="artist-name">{ticket.concert?.artist || "SYM"}</div>
              <div className="concert-label">World Tour 2026</div>

              <div className="divider-line" />

              <div className="info-grid">
                <div className="info-block">
                  <div className="info-label">Attendee</div>
                  <div className="info-value large">{ticket.user?.name}</div>
                </div>
                <div className="info-block">
                  <div className="info-label">Seat</div>
                  <div className="seat-badge">{ticket.seats?.join(", ")}</div>
                </div>
                <div className="info-block">
                  <div className="info-label">Date</div>
                  <div className="info-value">
                    {new Date(ticket.concert?.date).toLocaleDateString("en-SG", {
                      day: "2-digit", month: "short", year: "numeric"
                    })}
                  </div>
                </div>
                <div className="info-block">
                  <div className="info-label">Doors Open</div>
                  <div className="info-value">{ticket.concert?.startTime}</div>
                </div>
                <div className="info-block full-width">
                  <div className="info-label">Venue</div>
                  <div className="info-value">{ticket.concert?.venue}</div>
                </div>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "4px"
              }}>
                <div className="info-block">
                  <div className="info-label">Amount Paid</div>
                  <div style={{
                    fontFamily: "'Bebas Neue', cursive",
                    fontSize: "32px",
                    color: "#ffd970",
                    letterSpacing: "0.04em"
                  }}>
                    SGD {ticket.totalPrice}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.2)",
                  textAlign: "right",
                  lineHeight: "1.8"
                }}>
                  ADMIT ONE<br/>NON-TRANSFERABLE
                </div>
              </div>
            </div>

            {/* PERFORATION */}
            <div className="tear-edge" style={{ background: "#050508", position: "relative" }}>
              <div className="tear-circle-left" />
              <div className="tear-dots" style={{ flex: 1, margin: "0 18px" }} />
              <div className="tear-circle-right" />
            </div>

            {/* STUB */}
            <div className="ticket-stub">
              <div className="barcode-area">
                <div className="barcode scanline-container">
                  <div className="scanline" />
                  {bars.map((bar, i) => (
                    <div
                      key={i}
                      className="bar"
                      style={{
                        width: `${bar.w}px`,
                        height: `${bar.h}px`,
                        opacity: 0.7 + (i % 3) * 0.1
                      }}
                    />
                  ))}
                </div>
                <div className="barcode-num">{shortId}</div>
              </div>

              <div className="stub-divider" />

              <div className="entry-info">
                <div className="entry-pass-label">Entry Pass</div>
                <div className="entry-pass-text">General Admission</div>
                <div className="booking-id">
                  ID: {ticket._id}
                </div>
              </div>

              <div className="scan-icon">
                <QRMock />
                <div className="scan-label">Scan</div>
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div style={{
            textAlign: "center",
            marginTop: "20px",
            fontFamily: "'Space Mono', monospace",
            fontSize: "8px",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.12)",
            lineHeight: "1.8"
          }}>
            VALID FOR ONE ENTRY ONLY · NO RE-ENTRY · KEEP THIS TICKET SAFE
          </div>

        </div>
      </div>
    </>
  );
}

export default Ticket;
