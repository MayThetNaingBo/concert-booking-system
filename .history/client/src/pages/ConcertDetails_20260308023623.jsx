import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

/*
  ANGLE CONVENTION (SVG degrees, clockwise from 3 o'clock):
    0°   = right   (3 o'clock)
    90°  = bottom  (6 o'clock)  ← entrance gap centred here
    180° = left    (9 o'clock)
    270° = top     (12 o'clock)

  Arc = 320°, entrance gap = 40° centred at 90° (bottom).
  Seats start at  90 + 20  = 110°  (just clockwise of bottom-right)
  Seats end   at 110 + 320 = 430°  (= 70°, just anticlockwise of bottom-left)
*/
const GAP_DEG   = 40;
const ARC_DEG   = 360 - GAP_DEG;          // 320°
const START_DEG = 90 + GAP_DEG / 2;       // 110°
const SEAT_GAP  = 4;                       // px between tiles

const ZONES = [
  {
    id: "VIP", label: "VIP Floor",
    rows: [
      { row: "A", radius: 118, tileW: 28, tileH: 22 },
      { row: "B", radius: 152, tileW: 28, tileH: 22 },
      { row: "C", radius: 186, tileW: 28, tileH: 22 },
    ],
    color: { base: "#FFD700", lit: "#FFF59D", dark: "#A67C00", text: "#1a1000", border: "#C9A800" },
  },
  {
    id: "CAT1", label: "Category 1",
    rows: [
      { row: "D", radius: 228, tileW: 25, tileH: 20 },
      { row: "E", radius: 258, tileW: 25, tileH: 20 },
      { row: "F", radius: 288, tileW: 25, tileH: 20 },
    ],
    color: { base: "#FF5252", lit: "#FF8A80", dark: "#8B0000", text: "#fff", border: "#D32F2F" },
  },
  {
    id: "CAT2", label: "Category 2",
    rows: [
      { row: "G", radius: 330, tileW: 23, tileH: 18 },
      { row: "H", radius: 358, tileW: 23, tileH: 18 },
      { row: "I", radius: 386, tileW: 23, tileH: 18 },
    ],
    color: { base: "#00BFA5", lit: "#64FFDA", dark: "#00695C", text: "#fff", border: "#00897B" },
  },
  {
    id: "CAT3", label: "Category 3",
    rows: [
      { row: "J", radius: 428, tileW: 21, tileH: 16 },
      { row: "K", radius: 454, tileW: 21, tileH: 16 },
    ],
    color: { base: "#7C4DFF", lit: "#B388FF", dark: "#4527A0", text: "#fff", border: "#5E35B1" },
  },
];

const SVG_CX = 470, SVG_CY = 470;

function seatsForRing(radius, tileW) {
  return Math.max(2, Math.floor(((ARC_DEG * Math.PI) / 180 * radius) / (tileW + SEAT_GAP)));
}

// Pre-compute (x, y, deg, tileW, tileH, zone) for every seatNumber
function buildPositionMap() {
  const map = {};
  ZONES.forEach(zone => {
    zone.rows.forEach(({ row, radius, tileW, tileH }) => {
      const count = seatsForRing(radius, tileW);
      const step  = ARC_DEG / (count - 1);
      for (let i = 0; i < count; i++) {
        const deg = START_DEG + i * step;
        const rad = (deg * Math.PI) / 180;
        map[`${row}${i + 1}`] = {
          x: Math.cos(rad) * radius,
          y: Math.sin(rad) * radius,
          deg, tileW, tileH, zone: zone.id,
        };
      }
    });
  });
  return map;
}

const POSITION_MAP = buildPositionMap();
const ZONE_MAP     = {};
ZONES.forEach(z => { ZONE_MAP[z.id] = z; });

function ConcertDetails() {
  const { id } = useParams();
  const [seats,         setSeats]         = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip,       setTooltip]       = useState(null);
  const [hovered,       setHovered]       = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getSeats(id);
      setSeats(data);
    };
    fetchSeats();
  }, [id]);

  /* ── Original logic (unchanged) ── */
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
    return seat.category;
  };
  /* ──────────────────────────────── */

  const seatMap    = {};
  seats.forEach(s => { seatMap[s.seatNumber] = s; });
  const totalPrice = selectedSeats.reduce((acc, sn) => acc + (seatMap[sn]?.price || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:radial-gradient(ellipse at 50% 25%,#0e0e20 0%,#050508 65%); }

        .cd-page    { min-height:100vh; padding:5rem 1.5rem 1rem; font-family:'Outfit',sans-serif; }
        .cd-eyebrow { text-align:center; font-size:0.68rem; font-weight:700; letter-spacing:0.28em; text-transform:uppercase; color:#e8ff47; margin-bottom:0.4rem; }
        .cd-title   { font-family:'Bebas Neue',sans-serif; font-size:2.8rem; letter-spacing:0.07em; color:#fff; text-align:center; margin-bottom:1rem; line-height:1; }

        .zone-pills { display:flex; justify-content:center; flex-wrap:wrap; gap:0.5rem; padding:0 1rem 1.2rem; }
        .zone-pill  { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; padding:0.38rem 1rem; font-size:0.72rem; font-weight:600; letter-spacing:0.07em; color:rgba(255,255,255,0.6); }

        .sg .sb { transition:filter 0.12s; }
        .sg:hover .sb { filter:brightness(1.4) saturate(1.25); }
        .sg .ss { transition:opacity 0.12s; }
        .sg:hover .ss { opacity:0.9 !important; }

        .legend      { display:flex; justify-content:center; flex-wrap:wrap; gap:1rem; padding:0.5rem 1.5rem 1.2rem; }
        .legend-item { display:flex; align-items:center; gap:7px; font-size:0.72rem; font-weight:500; color:rgba(255,255,255,0.48); letter-spacing:0.06em; }
        .legend-sq   { width:16px; height:11px; border-radius:3px; flex-shrink:0; }

        .booking-bar   { position:fixed; bottom:0; left:0; right:0; background:rgba(6,6,16,0.97); backdrop-filter:blur(24px); border-top:1px solid rgba(255,255,255,0.07); padding:1rem 2.5rem; display:flex; align-items:center; justify-content:space-between; z-index:200; flex-wrap:wrap; gap:0.8rem; }
        .booking-seats { display:flex; flex-wrap:wrap; gap:0.4rem; flex:1; min-width:0; }
        .booking-tag   { font-size:0.68rem; font-weight:600; letter-spacing:0.06em; background:rgba(232,255,71,0.1); color:#e8ff47; border:1px solid rgba(232,255,71,0.22); padding:0.22rem 0.55rem; border-radius:2px; }
        .booking-right { display:flex; align-items:center; gap:1.5rem; flex-shrink:0; }
        .booking-total { font-family:'Bebas Neue',sans-serif; font-size:1.8rem; letter-spacing:0.05em; color:#fff; line-height:1; }
        .booking-count { font-size:0.6rem; letter-spacing:0.14em; text-transform:uppercase; color:rgba(255,255,255,0.28); }
        .booking-btn   { font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; border:none; padding:0.85rem 2.4rem; border-radius:3px; transition:all 0.2s; }
        .booking-btn:not(:disabled) { color:#050508; background:linear-gradient(135deg,#e8ff47,#c4d800); cursor:pointer; box-shadow:0 4px 22px rgba(232,255,71,0.28); }
        .booking-btn:not(:disabled):hover { box-shadow:0 6px 30px rgba(232,255,71,0.45); transform:translateY(-1px); }
        .booking-btn:disabled { color:rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); cursor:not-allowed; }
      `}</style>

      <div className="cd-page">
        <div className="cd-eyebrow">— Choose Your Spot —</div>
        <h1 className="cd-title">Seat Map</h1>

        <div className="zone-pills">
          {ZONES.map(z => (
            <div key={z.id} className="zone-pill">
              <span style={{ width:10,height:10,borderRadius:2,background:z.color.base,flexShrink:0,display:"inline-block" }}/>
              {z.label}
              <span style={{ color:z.color.lit }}>
                {seats.find(s => POSITION_MAP[s.seatNumber]?.zone === z.id)?.price
                  ? `RM${seats.find(s => POSITION_MAP[s.seatNumber]?.zone === z.id).price}` : ""}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center" }}>
          <svg viewBox="0 0 940 990" width="min(940px,98vw)" height="min(990px,98vw)" style={{ display:"block",overflow:"visible" }}>
            <defs>
              {ZONES.map(z => (
                <linearGradient key={z.id} id={`g-${z.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={z.color.lit}/><stop offset="100%" stopColor={z.color.dark}/>
                </linearGradient>
              ))}
              <linearGradient id="g-selected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8ff90"/><stop offset="100%" stopColor="#b0c000"/>
              </linearGradient>
              <linearGradient id="g-booked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#252535"/><stop offset="100%" stopColor="#111120"/>
              </linearGradient>
              <radialGradient id="g-floor" cx="50%" cy="45%" r="55%">
                <stop offset="0%" stopColor="#12122a"/><stop offset="100%" stopColor="#06060e"/>
              </radialGradient>
              <linearGradient id="g-stage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e2c00"/><stop offset="100%" stopColor="#0a0900"/>
              </linearGradient>
              <linearGradient id="g-stage-shine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(232,255,71,0.28)"/><stop offset="70%" stopColor="rgba(232,255,71,0)"/>
              </linearGradient>
              <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="f-stage-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="20" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="f-shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.75)"/>
              </filter>
            </defs>

            {/* Bowl */}
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={478} ry={468} fill="url(#g-floor)"/>
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={478} ry={468} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2.5}/>

            {/* Zone atmosphere bands */}
            {ZONES.map((z, zi) => {
              const o  = z.rows[z.rows.length-1].radius + 24;
              const i2 = zi === 0 ? 94 : ZONES[zi-1].rows[ZONES[zi-1].rows.length-1].radius + 8;
              return <circle key={z.id} cx={SVG_CX} cy={SVG_CY} r={(o+i2)/2} fill="none" stroke={z.color.base} strokeWidth={o-i2} opacity={0.045}/>;
            })}

            {/* Row guide rings */}
            {ZONES.flatMap(z => z.rows.map(r => (
              <circle key={z.id+r.row} cx={SVG_CX} cy={SVG_CY} r={r.radius}
                fill="none" stroke={z.color.base} strokeWidth={0.7} opacity={0.09} strokeDasharray="3 9"/>
            )))}

            {/* Zone boundary rings */}
            {ZONES.map((z, zi) => zi === 0 ? null : (
              <circle key={z.id+"-s"} cx={SVG_CX} cy={SVG_CY} r={z.rows[0].radius - 17}
                fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.2} strokeDasharray="5 5"/>
            ))}

            {/* ── Seat tiles from backend ── */}
            {seats.map(seat => {
              const pos = POSITION_MAP[seat.seatNumber];
              if (!pos) return null;
              const cx = SVG_CX + pos.x, cy = SVG_CY + pos.y;
              const { tileW, tileH, deg, zone } = pos;
              const z = ZONE_MAP[zone] || ZONE_MAP[seat.category];
              if (!z) return null;

              const state    = getSeatColor(seat);
              const isBooked = state === "booked";
              const isSel    = state === "selected";
              const isHov    = hovered === seat._id;
              const useGlow  = isSel || isHov;
              const fillId   = isBooked ? "g-booked" : isSel ? "g-selected" : `g-${zone}`;
              const stroke   = isBooked ? "#222232" : isSel ? "#e8ff47" : z.color.border;
              const textFill = isBooked ? "#2e2e48"  : isSel ? "#060600" : z.color.text;
              const rot      = `rotate(${deg + 90}, ${cx}, ${cy})`;
              const numLabel = seat.seatNumber.replace(/^[A-Za-z]+/, "");

              return (
                <g key={seat._id} className={isBooked ? "" : "sg"}
                  style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                  filter={useGlow ? "url(#f-glow)" : undefined}
                  opacity={isBooked ? 0.42 : 1}
                  onClick={() => handleSeatClick(seat)}
                  onMouseEnter={() => { if (!isBooked) { setHovered(seat._id); setTooltip({ seat, cx, cy, z }); } }}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                >
                  {isSel && (
                    <rect x={cx-tileW/2-4} y={cy-tileH/2-4} width={tileW+8} height={tileH+8} rx={4}
                      fill="rgba(232,255,71,0.16)" stroke="rgba(232,255,71,0.45)" strokeWidth={1} transform={rot}/>
                  )}
                  <rect className="sb" x={cx-tileW/2} y={cy-tileH/2} width={tileW} height={tileH} rx={3}
                    fill={`url(#${fillId})`} stroke={stroke} strokeWidth={0.8} filter="url(#f-shadow)" transform={rot}/>
                  <rect className="ss" x={cx-tileW/2+1.5} y={cy-tileH/2+1.5} width={tileW-3} height={tileH*0.36} rx={2}
                    fill="rgba(255,255,255,0.22)" opacity={isBooked ? 0 : 0.6} style={{ pointerEvents:"none" }} transform={rot}/>
                  {!isBooked && (
                    <text x={cx} y={cy+0.5} textAnchor="middle" dominantBaseline="middle" fill={textFill}
                      style={{ fontFamily:"'Outfit',sans-serif",fontSize:tileW*0.40,fontWeight:800,letterSpacing:"-0.02em",pointerEvents:"none",userSelect:"none" }}>
                      {numLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Skeleton placeholders while loading */}
            {seats.length === 0 && Object.entries(POSITION_MAP).map(([sn, pos]) => {
              const cx = SVG_CX + pos.x, cy = SVG_CY + pos.y;
              return (
                <rect key={sn} x={cx-pos.tileW/2} y={cy-pos.tileH/2} width={pos.tileW} height={pos.tileH} rx={3}
                  fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth={0.6}
                  transform={`rotate(${pos.deg+90},${cx},${cy})`}/>
              );
            })}

            {/* Row labels at top of each arc (270° = 12 o'clock) */}
            {ZONES.flatMap(z => z.rows.map(({ row, radius }) => {
              const labelRad = (270 * Math.PI) / 180;
              return (
                <text key={z.id+row}
                  x={SVG_CX + Math.cos(labelRad) * (radius - 2)}
                  y={SVG_CY + Math.sin(labelRad) * (radius - 2)}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={z.color.base} opacity={0.7}
                  style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:11,letterSpacing:"0.08em" }}>
                  {row}
                </text>
              );
            }))}

            {/* Zone badges */}
            {ZONES.map(z => {
              const mr   = z.rows[Math.floor(z.rows.length / 2)];
              const bRad = (270 * Math.PI) / 180;
              const bx   = SVG_CX + Math.cos(bRad) * mr.radius;
              const by   = SVG_CY + Math.sin(bRad) * mr.radius - 16;
              const bw   = z.id === "VIP" ? 48 : 60;
              return (
                <g key={z.id+"-badge"}>
                  <rect x={bx-bw/2} y={by-11} width={bw} height={18} rx={9}
                    fill={z.color.dark} stroke={z.color.border} strokeWidth={1} opacity={0.92}/>
                  <text x={bx} y={by+1} textAnchor="middle" dominantBaseline="middle"
                    fill={z.color.lit} opacity={0.95}
                    style={{ fontFamily:"'Outfit',sans-serif",fontSize:8.5,fontWeight:800,letterSpacing:"0.14em",pointerEvents:"none" }}>
                    {z.id === "VIP" ? "✦ VIP" : z.id}
                  </text>
                </g>
              );
            })}

            {/* Stage */}
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={104} ry={90} fill="rgba(232,255,71,0.07)" filter="url(#f-stage-glow)"/>
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={88} ry={74} fill="url(#g-stage)" stroke="#e8ff47" strokeWidth={1.8}/>
            <ellipse cx={SVG_CX} cy={SVG_CY-14} rx={70} ry={32} fill="url(#g-stage-shine)"/>
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={88} ry={74} fill="none" stroke="rgba(232,255,71,0.18)" strokeWidth={5}/>
            <ellipse cx={SVG_CX} cy={SVG_CY} rx={88} ry={74} fill="none" stroke="rgba(232,255,71,0.06)" strokeWidth={12}/>
            <text x={SVG_CX} y={SVG_CY-12} textAnchor="middle" fill="#e8ff47"
              style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:"0.32em" }}>STAGE</text>
            <text x={SVG_CX} y={SVG_CY+14} textAnchor="middle" fill="rgba(232,255,71,0.65)"
              style={{ fontFamily:"'Outfit',sans-serif",fontSize:16 }}>🎤</text>

            {/* Entrance */}
            <text x={SVG_CX} y={SVG_CY+505} textAnchor="middle" fill="rgba(255,255,255,0.5)"
              style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:"0.3em" }}>▲</text>
            <text x={SVG_CX} y={SVG_CY+523} textAnchor="middle" fill="rgba(255,255,255,0.22)"
              style={{ fontFamily:"'Outfit',sans-serif",fontSize:9.5,fontWeight:700,letterSpacing:"0.26em" }}>
              MAIN ENTRANCE
            </text>

            {/* Tooltip */}
            {tooltip && (() => {
              const { seat, cx, cy, z } = tooltip;
              const W = 96, H = 46;
              const tx = Math.min(Math.max(cx, W/2+12), 940-W/2-12), ty = cy - 30;
              return (
                <g style={{ pointerEvents:"none" }}>
                  <rect x={tx-W/2} y={ty-H} width={W} height={H} rx={6} fill="#0b0b1e" stroke={z.color.border} strokeWidth={1.2} opacity={0.97}/>
                  <rect x={tx-W/2} y={ty-H} width={5} height={H} fill={z.color.base} opacity={0.85}/>
                  <text x={tx-W/2+12} y={ty-H+13} fill="#fff" style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:14,letterSpacing:"0.08em" }}>Seat {seat.seatNumber}</text>
                  <text x={tx-W/2+12} y={ty-H+26} fill={z.color.lit} style={{ fontFamily:"'Outfit',sans-serif",fontSize:9,fontWeight:600 }}>{z.label}</text>
                  {seat.price && <text x={tx-W/2+12} y={ty-H+38} fill="rgba(255,255,255,0.65)" style={{ fontFamily:"'Outfit',sans-serif",fontSize:9,fontWeight:500 }}>RM {seat.price.toLocaleString()}</text>}
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="legend">
          {ZONES.map(z => (
            <div key={z.id} className="legend-item">
              <div className="legend-sq" style={{ background:z.color.base,border:`1px solid ${z.color.border}` }}/>{z.label}
            </div>
          ))}
          <div className="legend-item"><div className="legend-sq" style={{ background:"#1e1e30",border:"1px solid #252540" }}/>Unavailable</div>
          <div className="legend-item"><div className="legend-sq" style={{ background:"#e8ff47",border:"1px solid #c4d800" }}/>Your Selection</div>
        </div>
      </div>

      <div className="booking-bar">
        <div className="booking-seats">
          {selectedSeats.length === 0
            ? <span style={{ fontSize:"0.8rem",color:"rgba(255,255,255,0.18)",letterSpacing:"0.06em" }}>No seats selected — click the map to choose</span>
            : selectedSeats.map(sn => <span key={sn} className="booking-tag">{sn}</span>)
          }
        </div>
        <div className="booking-right">
          {selectedSeats.length > 0 && (
            <div>
              <div className="booking-count">{selectedSeats.length} seat{selectedSeats.length>1?"s":""}</div>
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
