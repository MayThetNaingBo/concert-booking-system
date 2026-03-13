import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

/* ─────────────────────────────────────────────────────────
   ZONE + ROW CONFIG
   Each zone = one ticket category.
   Each row within a zone = one concentric ring of seats.
   seatNumber format from backend: "A1", "B12", "J45" etc.
   (row letter + seat index)
───────────────────────────────────────────────────────── */
const ZONES = [
  {
    id: "VIP",
    label: "VIP Floor",
    rows: [
      { row: "A", radius: 102, count: 18, arcDeg: 270, tileW: 18, tileH: 14 },
      { row: "B", radius: 122, count: 22, arcDeg: 274, tileW: 18, tileH: 14 },
      { row: "C", radius: 143, count: 26, arcDeg: 278, tileW: 18, tileH: 14 },
    ],
    color: { base: "#FFD700", lit: "#FFF176", dark: "#B8860B", text: "#1a1000", border: "#DAA520" },
  },
  {
    id: "CAT1",
    label: "Category 1",
    rows: [
      { row: "D", radius: 172, count: 30, arcDeg: 284, tileW: 17, tileH: 13 },
      { row: "E", radius: 193, count: 34, arcDeg: 287, tileW: 17, tileH: 13 },
      { row: "F", radius: 215, count: 38, arcDeg: 290, tileW: 17, tileH: 13 },
    ],
    color: { base: "#E84545", lit: "#FF7676", dark: "#8B0000", text: "#fff", border: "#C62828" },
  },
  {
    id: "CAT2",
    label: "Category 2",
    rows: [
      { row: "G", radius: 254, count: 44, arcDeg: 295, tileW: 16, tileH: 12 },
      { row: "H", radius: 276, count: 48, arcDeg: 297, tileW: 16, tileH: 12 },
      { row: "I", radius: 299, count: 52, arcDeg: 299, tileW: 16, tileH: 12 },
    ],
    color: { base: "#00BFA5", lit: "#64FFDA", dark: "#00695C", text: "#fff", border: "#009688" },
  },
  {
    id: "CAT3",
    label: "Category 3",
    rows: [
      { row: "J", radius: 340, count: 58, arcDeg: 304, tileW: 15, tileH: 11 },
      { row: "K", radius: 363, count: 62, arcDeg: 306, tileW: 15, tileH: 11 },
    ],
    color: { base: "#7C4DFF", lit: "#B388FF", dark: "#4527A0", text: "#fff", border: "#651FFF" },
  },
];

const SVG_CX = 420, SVG_CY = 420;
const AISLE_HALF_DEG = 18; // gap at left/right sides

/* Pre-compute layout positions for all expected seat numbers */
function buildPositionMap() {
  const map = {};
  ZONES.forEach(zone => {
    zone.rows.forEach(({ row, radius, count, arcDeg, tileW, tileH }) => {
      const startDeg = -90 - arcDeg / 2;
      const step = arcDeg / (count - 1);
      let idx = 1;
      for (let i = 0; i < count; i++) {
        const deg = startDeg + i * step;
        const absDeg = ((deg + 90 + 360) % 360);
        const isAisle = (
          absDeg < AISLE_HALF_DEG ||
          absDeg > 360 - AISLE_HALF_DEG ||
          (absDeg > 180 - AISLE_HALF_DEG && absDeg < 180 + AISLE_HALF_DEG)
        );
        if (isAisle) continue;
        const rad = (deg * Math.PI) / 180;
        map[`${row}${idx}`] = {
          x: Math.cos(rad) * radius, y: Math.sin(rad) * radius,
          deg, tileW, tileH, zone: zone.id,
        };
        idx++;
      }
    });
  });
  return map;
}

const POSITION_MAP = buildPositionMap();
const ZONE_MAP = {};
ZONES.forEach(z => { ZONE_MAP[z.id] = z; });

function ConcertDetails() {
  const { id } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getSeats(id);
      setSeats(data);
    };
    fetchSeats();
  }, [id]);

  /* ── Original logic (unchanged) ─────────────────── */
  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;
    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  const getSeatColor = (seat) => {
    if (seat.isBooked)                           return "booked";
    if (selectedSeats.includes(seat.seatNumber)) return "selected";
    return seat.category; // VIP | CAT1 | CAT2 | CAT3
  };
  /* ─────────────────────────────────────────────── */

  const seatMap = {};
  seats.forEach(s => { seatMap[s.seatNumber] = s; });

  const totalPrice = selectedSeats.reduce((acc, sn) => acc + (seatMap[sn]?.price || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: radial-gradient(ellipse at 50% 30%, #0d0d1a 0%, #050508 60%); }

        .cd-page {
          min-height: 100vh;
          padding: 5rem 1.5rem 1rem;
          font-family: 'Outfit', sans-serif;
        }

        .cd-title-eyebrow {
          text-align: center;
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.28em; text-transform: uppercase;
          color: #e8ff47; margin-bottom: 0.4rem;
        }
        .cd-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.8rem; letter-spacing: 0.07em;
          color: #fff; text-align: center; margin-bottom: 1.2rem;
        }

        .zone-pills {
          display: flex; justify-content: center;
          flex-wrap: wrap; gap: 0.6rem;
          padding: 0 1rem 1.2rem;
        }
        .zone-pill {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 0.35rem 0.9rem;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.65);
        }
        .zone-pill-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

        .seat-g { cursor: pointer; }
        .seat-g:hover .seat-rect { filter: brightness(1.35) saturate(1.3); }
        .seat-g:hover .seat-top  { opacity: 0.85; }

        .legend {
          display: flex; justify-content: center;
          flex-wrap: wrap; gap: 1rem;
          padding: 0.5rem 1.5rem 1rem;
        }
        .legend-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 0.72rem; font-weight: 500;
          color: rgba(255,255,255,0.5); letter-spacing: 0.06em;
        }
        .legend-sq { width: 14px; height: 10px; border-radius: 2px; flex-shrink: 0; }

        .booking-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: rgba(6,6,14,0.97); backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding: 0.9rem 2.5rem;
          display: flex; align-items: center; justify-content: space-between;
          z-index: 200; flex-wrap: wrap; gap: 0.75rem;
        }
        .booking-seats { display: flex; flex-wrap: wrap; gap: 0.4rem; flex: 1; min-width: 0; }
        .booking-tag {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.06em;
          background: rgba(232,255,71,0.1); color: #e8ff47;
          border: 1px solid rgba(232,255,71,0.22);
          padding: 0.22rem 0.55rem; border-radius: 2px;
        }
        .booking-right { display: flex; align-items: center; gap: 1.5rem; flex-shrink: 0; }
        .booking-count { font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 1px; }
        .booking-total { font-family: 'Bebas Neue', sans-serif; font-size: 1.7rem; letter-spacing: 0.05em; color: #fff; line-height: 1; }
        .booking-btn {
          font-family: 'Outfit', sans-serif; font-size: 0.8rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          border: none; padding: 0.8rem 2.2rem; border-radius: 3px;
          transition: all 0.2s;
        }
        .booking-btn:not(:disabled) {
          color: #050508;
          background: linear-gradient(135deg, #e8ff47, #c9d800);
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(232,255,71,0.3);
        }
        .booking-btn:not(:disabled):hover {
          box-shadow: 0 6px 28px rgba(232,255,71,0.45);
          transform: translateY(-1px);
        }
        .booking-btn:disabled {
          color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.06);
          cursor: not-allowed;
        }
      `}</style>

      <div className="cd-page">
        <div className="cd-title-eyebrow">— Choose Your Spot —</div>
        <h1 className="cd-title">Seat Map</h1>

        {/* Zone pills */}
        <div className="zone-pills">
          {ZONES.map(z => (
            <div key={z.id} className="zone-pill">
              <span className="zone-pill-dot" style={{ background: z.color.base }} />
              {z.label}
              <span style={{ color: z.color.lit, marginLeft: 2 }}>RM{seatMap[Object.keys(seatMap).find(sn => {
                const pos = POSITION_MAP[sn];
                return pos && pos.zone === z.id;
              })]?.price || ""}</span>
            </div>
          ))}
        </div>

        {/* SVG Arena */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 840 860" width="min(840px, 98vw)" height="min(860px, 98vw)" style={{ display: "block", overflow: "visible" }}>
            <defs>
              {ZONES.map(z => (
                <linearGradient key={z.id} id={`grad-${z.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={z.color.lit}  />
                  <stop offset="100%" stopColor={z.color.dark} />
                </linearGradient>
              ))}
              <linearGradient id="grad-selected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#f5ff8a" />
                <stop offset="100%" stopColor="#b8cc00" />
              </linearGradient>
              <linearGradient id="grad-booked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2a2a38" />
                <stop offset="100%" stopColor="#14141e" />
              </linearGradient>
              <radialGradient id="arena-floor" cx="50%" cy="50%" r="55%">
                <stop offset="0%"   stopColor="#14142a" />
                <stop offset="100%" stopColor="#07070f" />
              </radialGradient>
              <linearGradient id="stage-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2a2800" />
                <stop offset="100%" stopColor="#0a0900" />
              </linearGradient>
              <linearGradient id="stage-shine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(232,255,71,0.25)" />
                <stop offset="60%"  stopColor="rgba(232,255,71,0)"   />
              </linearGradient>
              <filter id="fx-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="fx-stage" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="16" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="fx-shadow">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="rgba(0,0,0,0.7)" />
              </filter>
            </defs>

            {/* Arena bowl */}
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={400} ry={390} fill="url(#arena-floor)" />
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={400} ry={390} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2} />

            {/* Zone atmosphere bands */}
            {ZONES.map((z, zi) => {
              const outer = z.rows[z.rows.length - 1].radius + 20;
              const inner = zi === 0 ? 82 : ZONES[zi-1].rows[ZONES[zi-1].rows.length-1].radius + 5;
              return (
                <circle key={z.id+"-atmo"} cx={SVG_CX} cy={SVG_CY}
                  r={(outer + inner) / 2}
                  fill="none" stroke={z.color.base}
                  strokeWidth={outer - inner} opacity={0.04}
                />
              );
            })}

            {/* Row guide rings */}
            {ZONES.flatMap(z => z.rows.map(r => (
              <circle key={z.id+r.row} cx={SVG_CX} cy={SVG_CY} r={r.radius}
                fill="none" stroke={z.color.base}
                strokeWidth={0.6} opacity={0.08} strokeDasharray="2 8"
              />
            )))}

            {/* Aisle gaps */}
            {[-90, 90].map(a => {
              const rad = (a * Math.PI) / 180;
              return (
                <line key={a}
                  x1={SVG_CX} y1={SVG_CY}
                  x2={SVG_CX + Math.cos(rad) * 400}
                  y2={SVG_CY + Math.sin(rad) * 400}
                  stroke="rgba(255,255,255,0.04)" strokeWidth={18}
                />
              );
            })}

            {/* Zone boundary rings */}
            {ZONES.map((z, zi) => {
              if (zi === 0) return null;
              return (
                <circle key={z.id+"-bnd"} cx={SVG_CX} cy={SVG_CY}
                  r={z.rows[0].radius - 15}
                  fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1}
                  strokeDasharray="6 4"
                />
              );
            })}

            {/* ── SEAT TILES from backend ── */}
            {seats.map(seat => {
              const pos = POSITION_MAP[seat.seatNumber];
              if (!pos) return null;

              const cx = SVG_CX + pos.x;
              const cy = SVG_CY + pos.y;
              const { tileW, tileH, deg, zone } = pos;
              const z = ZONE_MAP[zone] || ZONE_MAP[seat.category];
              if (!z) return null;

              const state    = getSeatColor(seat);
              const isBooked = state === "booked";
              const isSel    = state === "selected";
              const isHov    = hovered === seat._id;
              const useGlow  = isSel || isHov;

              const fillId   = isBooked ? "grad-booked" : isSel ? "grad-selected" : `grad-${zone}`;
              const stroke   = isBooked ? "#252535" : isSel ? "#e8ff47" : z.color.border;
              const textFill = isBooked ? "#3a3a52" : isSel ? "#050508" : z.color.text;
              const opacity  = isBooked ? 0.5 : 1;
              const rot      = `rotate(${deg + 90}, ${cx}, ${cy})`;

              return (
                <g
                  key={seat._id}
                  className={isBooked ? "" : "seat-g"}
                  style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                  filter={useGlow ? "url(#fx-glow)" : undefined}
                  opacity={opacity}
                  onClick={() => handleSeatClick(seat)}
                  onMouseEnter={() => { if (!isBooked) { setHovered(seat._id); setTooltip({ seat, cx, cy, z }); } }}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                >
                  {isSel && (
                    <rect x={cx - tileW/2 - 3} y={cy - tileH/2 - 3}
                      width={tileW+6} height={tileH+6} rx={3.5}
                      fill="rgba(232,255,71,0.18)" stroke="rgba(232,255,71,0.4)" strokeWidth={0.8}
                      transform={rot}
                    />
                  )}
                  {/* Body */}
                  <rect className="seat-rect"
                    x={cx - tileW/2} y={cy - tileH/2}
                    width={tileW} height={tileH} rx={2.5}
                    fill={`url(#${fillId})`} stroke={stroke} strokeWidth={0.7}
                    filter="url(#fx-shadow)"
                    transform={rot}
                  />
                  {/* Top highlight */}
                  <rect className="seat-top"
                    x={cx - tileW/2 + 1} y={cy - tileH/2 + 1}
                    width={tileW - 2} height={tileH * 0.38} rx={2}
                    fill="rgba(255,255,255,0.18)" opacity={0.55}
                    style={{ pointerEvents: "none" }}
                    transform={rot}
                  />
                  {/* Number */}
                  {!isBooked && (
                    <text x={cx} y={cy + 0.5}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={textFill}
                      style={{ fontFamily: "'Outfit',sans-serif", fontSize: tileW * 0.42, fontWeight: 800, letterSpacing: "-0.02em", pointerEvents: "none", userSelect: "none" }}
                    >
                      {seat.seatNumber.replace(/^[A-Z]/,"").replace(/^[A-Z]+/,"")}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Placeholders while loading */}
            {seats.length === 0 && Object.entries(POSITION_MAP).map(([sn, pos]) => {
              const cx = SVG_CX + pos.x, cy = SVG_CY + pos.y;
              return (
                <rect key={sn}
                  x={cx - pos.tileW/2} y={cy - pos.tileH/2}
                  width={pos.tileW} height={pos.tileH} rx={2.5}
                  fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}
                  transform={`rotate(${pos.deg + 90}, ${cx}, ${cy})`}
                />
              );
            })}

            {/* Row labels */}
            {ZONES.flatMap(z => z.rows.map(({ row, radius, arcDeg }) => {
              const labelDeg = -90 - arcDeg / 2 - 6;
              const rad = (labelDeg * Math.PI) / 180;
              return (
                <text key={z.id+row+"-lbl"}
                  x={SVG_CX + Math.cos(rad) * radius}
                  y={SVG_CY + Math.sin(rad) * radius}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={z.color.base} opacity={0.7}
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 10, letterSpacing: "0.1em" }}
                >
                  {row}
                </text>
              );
            }))}

            {/* Zone name badges */}
            {ZONES.map(z => {
              const midRow = z.rows[Math.floor(z.rows.length / 2)];
              const lx = SVG_CX, ly = SVG_CY - midRow.radius;
              return (
                <g key={z.id+"-badge"}>
                  <rect x={lx - 26} y={ly - 10} width={52} height={16} rx={8}
                    fill={z.color.dark} stroke={z.color.border} strokeWidth={0.8} opacity={0.9}
                  />
                  <text x={lx} y={ly + 1} textAnchor="middle" dominantBaseline="middle"
                    fill={z.color.lit} opacity={0.95}
                    style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", pointerEvents: "none" }}
                  >
                    {z.id === "VIP" ? "✦ VIP" : z.id}
                  </text>
                </g>
              );
            })}

            {/* Stage */}
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={90} ry={78} fill="rgba(232,255,71,0.06)" filter="url(#fx-stage)" />
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={76} ry={64} fill="url(#stage-grad)" stroke="#e8ff47" strokeWidth={1.5} />
            <ellipse cx={SVG_CX} cy={SVG_CY-12} rx={62} ry={28} fill="url(#stage-shine)" />
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={76} ry={64} fill="none" stroke="rgba(232,255,71,0.15)" strokeWidth={4} />
            <text x={SVG_CX} y={SVG_CY - 10} textAnchor="middle" fill="#e8ff47"
              style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: "0.3em" }}>
              STAGE
            </text>
            <text x={SVG_CX} y={SVG_CY + 12} textAnchor="middle" fill="rgba(232,255,71,0.6)"
              style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15 }}>
              🎤
            </text>

            {/* Entrance */}
            <text x={SVG_CX} y={SVG_CY + 418} textAnchor="middle" fill="rgba(255,255,255,0.18)"
              style={{ fontFamily: "'Outfit',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.25em" }}>
              ▲  MAIN ENTRANCE
            </text>

            {/* Tooltip */}
            {tooltip && (() => {
              const { seat, cx, cy, z } = tooltip;
              const w = 90, h = 44;
              const tx = Math.min(Math.max(cx, w/2+10), 840-w/2-10);
              const ty = cy - 28;
              return (
                <g style={{ pointerEvents: "none" }}>
                  <rect x={tx-w/2} y={ty-h} width={w} height={h} rx={5}
                    fill="#0c0c1e" stroke={z.color.border} strokeWidth={1} opacity={0.97}
                  />
                  <rect x={tx-w/2} y={ty-h} width={4} height={h} rx={0} fill={z.color.base} opacity={0.9} />
                  <text x={tx-w/2+10} y={ty-h+12} fill="#fff"
                    style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 13, letterSpacing: "0.08em" }}>
                    Seat {seat.seatNumber}
                  </text>
                  <text x={tx-w/2+10} y={ty-h+24} fill={z.color.lit}
                    style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8.5, fontWeight: 600 }}>
                    {z.label}
                  </text>
                  {seat.price && (
                    <text x={tx-w/2+10} y={ty-h+36} fill="rgba(255,255,255,0.7)"
                      style={{ fontFamily: "'Outfit',sans-serif", fontSize: 8.5, fontWeight: 500 }}>
                      RM {seat.price.toLocaleString()}
                    </text>
                  )}
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Legend */}
        <div className="legend">
          {ZONES.map(z => (
            <div key={z.id} className="legend-item">
              <div className="legend-sq" style={{ background: z.color.base, border: `1px solid ${z.color.border}` }} />
              {z.label}
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-sq" style={{ background: "#1c1c2e", border: "1px solid #252535" }} />
            Unavailable
          </div>
          <div className="legend-item">
            <div className="legend-sq" style={{ background: "#e8ff47", border: "1px solid #c9d800" }} />
            Your Selection
          </div>
        </div>
      </div>

      {/* Booking bar */}
      <div className="booking-bar">
        <div className="booking-seats">
          {selectedSeats.length === 0
            ? <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em" }}>
                No seats selected — click on the map to choose
              </span>
            : selectedSeats.map(sn => <span key={sn} className="booking-tag">{sn}</span>)
          }
        </div>
        <div className="booking-right">
          {selectedSeats.length > 0 && (
            <div style={{ textAlign: "right" }}>
              <div className="booking-count">{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}</div>
              <div className="booking-total">RM {totalPrice.toLocaleString()}</div>
            </div>
          )}
          <button className="booking-btn" disabled={selectedSeats.length === 0}>
            Confirm Booking →
          </button>
        </div>
      </div>
    </>
  );
}

export default ConcertDetails;
