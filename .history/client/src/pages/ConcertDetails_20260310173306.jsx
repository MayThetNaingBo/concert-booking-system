import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

const SVG_W = 1000;
const STAGE_W = 220;
const STAGE_H = 70;
const STAGE_X = SVG_W / 2 - STAGE_W / 2;
const STAGE_Y = 30;

const ARC_CX = SVG_W / 2;
const ARC_CY = STAGE_Y + STAGE_H - 10;

const ARC_HALF = 80;
const ARC_START = 90 - ARC_HALF;
const ARC_END = 90 + ARC_HALF;

const AISLE_W = 44;
const TILE_W = 26;
const TILE_H = 20;
const SEAT_PIX_GAP = 4;

const ZONES = [
  {
    id: "VIP", label: "VIP Floor", price: 300,
    rows: [
      { row: "A", radius: 130 },
      { row: "B", radius: 158 },
      { row: "C", radius: 186 },
    ],
    color: { base: "#21ecec", border: "#0040c9" }
  },
  {
    id: "CAT1", label: "Category 1", price: 200,
    rows: [
      { row: "D", radius: 222 },
      { row: "E", radius: 250 },
      { row: "F", radius: 278 },
      { row: "G", radius: 306 },
    ],
    color: { base: "#FF5252", border: "#D32F2F" }
  },
  {
    id: "CAT2", label: "Category 2", price: 120,
    rows: [
      { row: "H", radius: 342 },
      { row: "I", radius: 370 },
      { row: "J", radius: 398 },
      { row: "K", radius: 426 },
    ],
    color: { base: "#00BFA5", border: "#00897B" }
  },
  {
    id: "CAT3", label: "Category 3", price:80,
    rows: [
      { row: "L", radius: 462 },
      { row: "M", radius: 490 },
    ],
    color: { base: "#7C4DFF", border: "#5E35B1" }
  },
];

const ZONE_MAP = {};
ZONES.forEach(z => { ZONE_MAP[z.id] = z; });

function buildPositionMap() {

  const map = {};

  ZONES.forEach(zone => {

    zone.rows.forEach(({ row, radius }) => {

      const degPerPx = 360 / (2 * Math.PI * radius);
      const tileAngle = TILE_W * degPerPx;
      const gapAngle = SEAT_PIX_GAP * degPerPx;
      const stepAngle = tileAngle + gapAngle;
      const aisleAngle = (AISLE_W / 2) * degPerPx;

      const leftSeats = [];

      for (
        let deg = 90 - aisleAngle - tileAngle / 2;
        deg - tileAngle / 2 >= ARC_START;
        deg -= stepAngle
      ) {
        leftSeats.push(deg);
      }

      leftSeats.reverse();

      const rightSeats = [];

      for (
        let deg = 90 + aisleAngle + tileAngle / 2;
        deg + tileAngle / 2 <= ARC_END;
        deg += stepAngle
      ) {
        rightSeats.push(deg);
      }

      let seatNum = 1;

      [...leftSeats, ...rightSeats].forEach(deg => {

        const rad = (deg * Math.PI) / 180;

        map[`${row}${seatNum}`] = {
          x: ARC_CX + Math.cos(rad) * radius,
          y: ARC_CY + Math.sin(rad) * radius,
          deg,
          zone: zone.id
        };

        seatNum++;

      });

    });

  });

  return map;
}

const POSITION_MAP = buildPositionMap();

const deepest = Math.max(...Object.values(POSITION_MAP).map(p => p.y));
const SVG_H = deepest + TILE_H + 80;

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    getSeats(id).then(setSeats);
  }, [id]);

  const handleSeatClick = (seat) => {

    if (seat.isBooked) return;

    setSelectedSeats(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );

  };

  const seatMap = {};
  seats.forEach(s => { seatMap[s.seatNumber] = s; });

  const totalPrice = selectedSeats.reduce((acc, sn) => {

  const pos = POSITION_MAP[sn];
  if (!pos) return acc;

  const zone = ZONE_MAP[pos.zone];

  return acc + zone.price;

}, 0);

  const handleBooking = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          concertId: id,
          seats: selectedSeats,
          totalPrice: Number(totalPrice)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      alert("Booking successful 🎉");
      setSelectedSeats([]);

    } catch (err) {
      alert("Booking error");
    }};

  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .cd-page {
          min-height: 100vh;
          padding: 3rem 0 6rem;
          font-family: 'Outfit', sans-serif;
          background: radial-gradient(ellipse at 50% 10%, #0e0e28 0%, #050508 65%);
        }

        .cd-header { text-align: center; margin-bottom: 1.4rem; }

        .cd-eyebrow {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #e8ff47;
          margin-bottom: 0.3rem;
        }

        .cd-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          letter-spacing: 0.1em;
          color: #fff;
          line-height: 1;
        }

        .zone-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0 1rem 1.2rem;
        }

        .zone-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 0.3rem 0.8rem;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.5);
        }

        .seat-svg-wrap {
          display: flex;
          justify-content: center;
          overflow-x: auto;
          width: 100%;
        }

        .seat-g { cursor: pointer; }
        .seat-g:hover .sr { filter: brightness(1.5) saturate(1.2); }

        .legend {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.8rem;
          padding: 0.8rem 1.5rem 1.2rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.05em;
        }

        .legend-sq {
          width: 14px;
          height: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .booking-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(5,5,14,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 0.85rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 200;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .booking-seats {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
          flex: 1;
          min-width: 0;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.16);
          letter-spacing: 0.06em;
        }

        .booking-tag {
          font-size: 0.63rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          background: rgba(232,255,71,0.1);
          color: #e8ff47;
          border: 1px solid rgba(232,255,71,0.22);
          padding: 0.18rem 0.48rem;
          border-radius: 2px;
        }

        .booking-right {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          flex-shrink: 0;
        }

        .booking-info-count {
          font-size: 0.55rem;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        .booking-info-total {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.65rem;
          letter-spacing: 0.05em;
          color: #fff;
          line-height: 1;
        }

        .booking-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.11em;
          text-transfo~rm: uppercase;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 3px;
          transition: all 0.18s;
        }

        .booking-btn:not(:disabled) {
          color: #050508;
          background: linear-gradient(135deg, #e8ff47, #c4d800);
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(232,255,71,0.25);
        }

        .booking-btn:not(:disabled):hover {
          box-shadow: 0 6px 28px rgba(232,255,71,0.45);
          transform: translateY(-1px);
        }

        .booking-btn:disabled {
          color: rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          cursor: not-allowed;
        }
      `}</style>

      <div className="cd-page">

        <div className="cd-header">
          <div className="cd-eyebrow">— Choose Your Spot —</div>
          <div className="cd-title">Seat Map</div>
        </div>

        <div className="zone-pills">
          {ZONES.map(z => (
            <div key={z.id} className="zone-pill">
              <span style={{
                width: 8, height: 8, borderRadius: 2,
                background: z.color.base, flexShrink: 0, display: "inline-block"
              }}/>
              {z.label}
              <span style={{ color: z.color.base }}>· SGD{z.price}</span>
            </div>
          ))}
        </div>

        <div className="seat-svg-wrap">
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            height={SVG_H}
            style={{ display: "block", maxWidth: "100%", height: "auto" }}
          >
            <defs>
              {ZONES.map(z => (
                <linearGradient key={z.id} id={`gz-${z.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={z.color.base}/>
                  <stop offset="100%" stopColor={z.color.border}/>
                </linearGradient>
              ))}
              <linearGradient id="gz-selected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8ff90"/>
                <stop offset="100%" stopColor="#9eb000"/>
              </linearGradient>
              <linearGradient id="gz-booked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1e2e"/>
                <stop offset="100%" stopColor="#0d0d18"/>
              </linearGradient>
              <linearGradient id="g-stage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1e00"/>
                <stop offset="100%" stopColor="#080700"/>
              </linearGradient>
              <linearGradient id="g-stage-shine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(232,255,71,0.3)"/>
                <stop offset="100%" stopColor="rgba(232,255,71,0)"/>
              </linearGradient>
              <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="f-stage-glow" x="-60%" y="-100%" width="220%" height="300%">
                <feGaussianBlur stdDeviation="20" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="f-shadow">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(0,0,0,0.7)"/>
              </filter>
            </defs>

            {/* Stage */}
            <rect
              x={STAGE_X - 16} y={STAGE_Y - 10}
              width={STAGE_W + 32} height={STAGE_H + 20} rx={10}
              fill="rgba(232,255,71,0.07)" filter="url(#f-stage-glow)"
            />
            <rect
              x={STAGE_X} y={STAGE_Y}
              width={STAGE_W} height={STAGE_H} rx={7}
              fill="url(#g-stage)" stroke="#e8ff47" strokeWidth={1.8}
            />
            <rect
              x={STAGE_X + 6} y={STAGE_Y + 5}
              width={STAGE_W - 12} height={STAGE_H * 0.4} rx={4}
              fill="url(#g-stage-shine)"
            />
            <rect
              x={STAGE_X} y={STAGE_Y}
              width={STAGE_W} height={STAGE_H} rx={7}
              fill="none" stroke="rgba(232,255,71,0.15)" strokeWidth={8}
            />
            <text
              x={SVG_W / 2} y={STAGE_Y + STAGE_H / 2 - 6}
              textAnchor="middle" fill="#e8ff47"
              style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: "0.3em" }}
            >STAGE</text>
            <text
              x={SVG_W / 2} y={STAGE_Y + STAGE_H / 2 + 13}
              textAnchor="middle" fill="rgba(232,255,71,0.5)"
              style={{ fontSize: 13 }}
            >🎤</text>

            {/* Arc guide rings */}
            {ZONES.flatMap(z => z.rows.map(({ radius }) => (
              <circle
                key={z.id + radius}
                cx={ARC_CX} cy={ARC_CY} r={radius}
                fill="none" stroke={z.color.base}
                strokeWidth={0.4} opacity={0.06} strokeDasharray="3 9"
              />
            )))}

            {/* Aisle band */}
            <line
              x1={ARC_CX}
              y1={ARC_CY + ZONES[0].rows[0].radius - 18}
              x2={ARC_CX}
              y2={ARC_CY + ZONES[ZONES.length - 1].rows[ZONES[ZONES.length - 1].rows.length - 1].radius + 18}
              stroke="rgba(255,255,255,0.06)" strokeWidth={AISLE_W}
            />
            <line
              x1={ARC_CX}
              y1={ARC_CY + ZONES[0].rows[0].radius - 18}
              x2={ARC_CX}
              y2={ARC_CY + ZONES[ZONES.length - 1].rows[ZONES[ZONES.length - 1].rows.length - 1].radius + 18}
              stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 6"
            />
            <text
              x={ARC_CX} y={ARC_CY + ZONES[1].rows[1].radius}
              textAnchor="middle" fill="rgba(255,255,255,0.15)"
              style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 9, letterSpacing: "0.2em" }}
            >AISLE</text>

            {/* Zone atmosphere arcs */}
            {ZONES.map(z => {
              const r1 = z.rows[0].radius - 14;
              const r2 = z.rows[z.rows.length - 1].radius + 14;
              const rMid = (r1 + r2) / 2;
              const thickness = r2 - r1;
              const sRad = ARC_START * Math.PI / 180;
              const eRad = ARC_END * Math.PI / 180;
              const x1 = ARC_CX + Math.cos(sRad) * rMid;
              const y1 = ARC_CY + Math.sin(sRad) * rMid;
              const x2 = ARC_CX + Math.cos(eRad) * rMid;
              const y2 = ARC_CY + Math.sin(eRad) * rMid;
              return (
                <path
                  key={z.id + "-band"}
                  d={`M ${x1} ${y1} A ${rMid} ${rMid} 0 0 1 ${x2} ${y2}`}
                  fill="none" stroke={z.color.base}
                  strokeWidth={thickness} opacity={0.045}
                />
              );
            })}

            {/* Seats */}
            {Object.entries(POSITION_MAP).map(([seatNumber, pos]) => {

              const seat = seatMap[seatNumber];
              if (!seat) return null;

              const zone = ZONE_MAP[pos.zone];
              const isBooked = seat.isBooked;
              const isSel = selectedSeats.includes(seatNumber);
              const isHov = hovered === seatNumber;

              const fillId = isBooked ? "gz-booked" : isSel ? "gz-selected" : `gz-${pos.zone}`;
              const stroke = isBooked ? "#1a1a2c" : isSel ? "#e8ff47" : zone.color.border;
              const textFill = isBooked ? "#252540" : isSel ? "#050500" : "#000";
              const deg = pos.deg ?? 90;
              const rot = `rotate(${deg - 90}, ${pos.x}, ${pos.y})`;
              const numLabel = seatNumber.replace(/^[A-Za-z]+/, "");

              return (
                <g
                  key={seatNumber}
                  className={isBooked ? "" : "seat-g"}
                  style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                  filter={(isSel || isHov) ? "url(#f-glow)" : undefined}
                  opacity={isBooked ? 0.3 : 1}
                  onClick={() => handleSeatClick(seat)}
                  onMouseEnter={() => {
                    if (!isBooked) {
                      setHovered(seatNumber);
                      setTooltip({ seat, x: pos.x, y: pos.y, zone });
                    }
                  }}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                >
                  {isSel && (
                    <rect
                      x={pos.x - TILE_W / 2 - 3} y={pos.y - TILE_H / 2 - 3}
                      width={TILE_W + 6} height={TILE_H + 6} rx={5}
                      fill="rgba(232,255,71,0.14)" stroke="rgba(232,255,71,0.5)"
                      strokeWidth={1} transform={rot}
                    />
                  )}
                  <rect
                    className="sr"
                    x={pos.x - TILE_W / 2} y={pos.y - TILE_H / 2}
                    width={TILE_W} height={TILE_H} rx={4}
                    fill={`url(#${fillId})`} stroke={stroke} strokeWidth={0.9}
                    filter="url(#f-shadow)" transform={rot}
                  />
                  <rect
                    x={pos.x - TILE_W / 2 + 2} y={pos.y - TILE_H / 2 + 2}
                    width={TILE_W - 4} height={TILE_H * 0.38} rx={2}
                    fill="rgba(255,255,255,0.2)" transform={rot}
                    style={{ pointerEvents: "none" }}
                  />
                  {!isBooked && (
                    <text
                      x={pos.x} y={pos.y + 0.5}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={textFill}
                      style={{
                        fontFamily: "'Outfit',sans-serif",
                        fontSize: 9,
                        fontWeight: 800,
                        pointerEvents: "none",
                        userSelect: "none"
                      }}
                    >{numLabel}</text>
                  )}
                </g>
              );
            })}

            {/* Row labels */}
            {ZONES.flatMap(z => z.rows.map(({ row, radius }) => {
              const edgeDeg = ARC_START - 4;
              const lx = ARC_CX + Math.cos(edgeDeg * Math.PI / 180) * radius;
              const ly = ARC_CY + Math.sin(edgeDeg * Math.PI / 180) * radius;
              return (
                <text
                  key={row + "-lbl"}
                  x={lx - 5} y={ly + 4}
                  textAnchor="end" dominantBaseline="middle"
                  fill={z.color.base} opacity={0.7}
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 10, letterSpacing: "0.06em" }}
                >{row}</text>
              );
            }))}

            {/* Zone badges */}
            {ZONES.map(z => {
              const midRow = z.rows[Math.floor(z.rows.length / 2)];
              const edgeDeg = ARC_END + 5;
              const bx = ARC_CX + Math.cos(edgeDeg * Math.PI / 180) * midRow.radius;
              const by = ARC_CY + Math.sin(edgeDeg * Math.PI / 180) * midRow.radius;
              const bw = z.id === "VIP" ? 42 : 54;
              return (
                <g key={z.id + "-badge"}>
                  <rect
                    x={bx} y={by - 9} width={bw} height={18} rx={9}
                    fill={z.color.border} stroke={z.color.base} strokeWidth={1} opacity={0.92}
                  />
                  <text
                    x={bx + bw / 2} y={by + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={z.color.base} opacity={0.98}
                    style={{
                      fontFamily: "'Outfit',sans-serif",
                      fontSize: 8, fontWeight: 800,
                      letterSpacing: "0.13em",
                      pointerEvents: "none"
                    }}
                  >{z.id === "VIP" ? "✦ VIP" : z.id}</text>
                </g>
              );
            })}

            {/* Entrance */}
            <text
              x={SVG_W / 2} y={SVG_H - 26}
              textAnchor="middle" fill="rgba(255,255,255,0.35)"
              style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, letterSpacing: "0.25em" }}
            >▲</text>
            <text
              x={SVG_W / 2} y={SVG_H - 10}
              textAnchor="middle" fill="rgba(255,255,255,0.15)"
              style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.22em" }}
            >MAIN ENTRANCE</text>

            {/* Tooltip */}
            {tooltip && (() => {
              const { seat, x, y, zone } = tooltip;
              const W = 106, H = 52;
              const tx = Math.min(Math.max(x, W / 2 + 10), SVG_W - W / 2 - 10);
              const ty = y - 14;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect
                    x={tx - W / 2} y={ty - H} width={W} height={H} rx={6}
                    fill="#08081a" stroke={zone.color.border} strokeWidth={1.2} opacity={0.97}
                  />
                  <rect x={tx - W / 2} y={ty - H} width={5} height={H} fill={zone.color.base} opacity={0.85}/>
                  <text
                    x={tx - W / 2 + 12} y={ty - H + 15} fill="#fff"
                    style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, letterSpacing: "0.07em" }}
                  >Seat {seat.seatNumber}</text>
                  <text
                    x={tx - W / 2 + 12} y={ty - H + 29} fill={zone.color.base}
                    style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, fontWeight: 600 }}
                  >{zone.label}</text>
                  <text
  x={tx - W / 2 + 12}
  y={ty - H + 43}
  fill="rgba(255,255,255,0.55)"
  style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9 }}
>
  SGD {zone.price}
</text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="legend">
          {ZONES.map(z => (
            <div key={z.id} className="legend-item">
              <div className="legend-sq" style={{ background: z.color.base, border: `1px solid ${z.color.border}` }}/>
              {z.label}
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-sq" style={{ background: "#1a1a2e", border: "1px solid #252542" }}/>
            Unavailable
          </div>
          <div className="legend-item">
            <div className="legend-sq" style={{ background: "#e8ff47", border: "1px solid #c4d800" }}/>
            Your Selection
          </div>
        </div>

      </div>

      {/* Booking bar */}
      <div className="booking-bar">
        <div className="booking-seats">
          {selectedSeats.length === 0
            ? <span>No seats selected — click the map to choose</span>
            : selectedSeats.map(sn => <span key={sn} className="booking-tag">{sn}</span>)
          }
        </div>
        <div className="booking-right">
          {selectedSeats.length > 0 && (
            <div>
              <div className="booking-info-count">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}
              </div>
              <div className="booking-info-total">SGD {totalPrice.toLocaleString()}</div>
            </div>
          )}
          <button
            className="booking-btn"
            disabled={selectedSeats.length === 0}
            onClick={handleBooking}
          >
            Confirm Booking →
          </button>
        </div>
      </div>
    </>
  );
}

export default ConcertDetails;
