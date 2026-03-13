import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

/*
  LAYOUT:
  - Square stage at top-centre
  - Seats in curved rows (arc of a circle) below the stage
  - Each successive zone sits at a larger radius → curves progressively
  - Centre aisle splits every row into LEFT block and RIGHT block
  - Aisle width = 40px
  - Arc is centred at 270° (top), sweeping from ~200° to ~340° (140° total)
    so rows curve gently around the stage

  Arc geometry:
    Centre point (CX, CY) is above the SVG, so arcs appear as gentle curves.
    CY_ARC = stage bottom + offset so the curvature looks natural.
    Each zone row sits at a different radius from CY_ARC.
*/

const SVG_W       = 1000;
const STAGE_W     = 220;
const STAGE_H     = 70;
const STAGE_X     = SVG_W / 2 - STAGE_W / 2;
const STAGE_Y     = 30;

// Arc focus point — seats curve around this point
const ARC_CX      = SVG_W / 2;
const ARC_CY      = STAGE_Y + STAGE_H - 10;

// Arc sweep — 160° total centred at 90° (pointing down)
const ARC_HALF    = 80;
const ARC_START   = 90 - ARC_HALF;  // 10°
const ARC_END     = 90 + ARC_HALF;  // 170°

const AISLE_W      = 44;  // px gap for centre aisle
const TILE_W       = 26;  // default tile width
const TILE_H       = 20;
const SEAT_PIX_GAP = 4;   // default gap between tiles

// Per-row tile sizes are used to pack exactly the right number of seats
// within the fixed arcHalf=80 without going off-canvas:
//   CAT2 rows H–K: tileW=26 gap=2 → H=32, I=34, J=38, K=40
//   CAT3 row  L:   tileW=22 gap=3 → L=50
//   CAT3 row  M:   tileW=19 gap=3 → M=60
const ZONES = [
  {
    id: "VIP", label: "VIP Floor",
    rows: [
      { row: "A", radius: 130 },
      { row: "B", radius: 158 },
      { row: "C", radius: 186 },
    ],
    color: { base: "#FFD700", lit: "#FFF176", dark: "#7a5800", text: "#1a1000", border: "#C9A800" },
  },
  {
    id: "CAT1", label: "Category 1",
    rows: [
      { row: "D", radius: 222 },
      { row: "E", radius: 250 },
      { row: "F", radius: 278 },
      { row: "G", radius: 306 },
    ],
    color: { base: "#FF5252", lit: "#FF8A80", dark: "#7f0000", text: "#fff", border: "#D32F2F" },
  },
  {
    id: "CAT2", label: "Category 2",
    rows: [
      { row: "H", radius: 342, tileW: 26, gap: 2 },
      { row: "I", radius: 370, tileW: 26, gap: 2 },
      { row: "J", radius: 398, tileW: 26, gap: 2 },
      { row: "K", radius: 426, tileW: 26, gap: 2 },
    ],
    color: { base: "#00BFA5", lit: "#64FFDA", dark: "#004d43", text: "#fff", border: "#00897B" },
  },
  {
    id: "CAT3", label: "Category 3",
    rows: [
      { row: "L", radius: 462, tileW: 22, gap: 3 },
      { row: "M", radius: 490, tileW: 19, gap: 3 },
      
    ],
    color: { base: "#7C4DFF", lit: "#B388FF", dark: "#311b92", text: "#fff", border: "#5E35B1" },
  },
];

const ZONE_MAP = {};
ZONES.forEach(z => { ZONE_MAP[z.id] = z; });

// Convert polar (angle in degrees, radius) → SVG (x, y) relative to ARC_CX, ARC_CY
function polarToXY(deg, radius) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: ARC_CX + Math.cos(rad) * radius,
    y: ARC_CY + Math.sin(rad) * radius,
  };
}

// Build position map: seatNumber → { x, y, deg, zone, side }
function buildPositionMap() {
  const map = {};
  ZONES.forEach(zone => {
    zone.rows.forEach(({ row, radius, tileW: rowTileW, gap: rowGap }) => {
      const tw         = rowTileW !== undefined ? rowTileW : TILE_W;
      const gp         = rowGap   !== undefined ? rowGap   : SEAT_PIX_GAP;

      // Convert pixel sizes to angles at this radius
      const degPerPx   = 360 / (2 * Math.PI * radius);
      const tileAngle  = tw * degPerPx;
      const gapAngle   = gp * degPerPx;
      const stepAngle  = tileAngle + gapAngle;
      const aisleAngle = (AISLE_W / 2) * degPerPx;

      const leftSeats = [];
let deg = 90 - aisleAngle - tileAngle / 2;

while (deg > ARC_START) {
  leftSeats.push(deg);
  deg -= stepAngle;
}

// Ensure the very edge seat fills remaining space
if (leftSeats[leftSeats.length - 1] - stepAngle > ARC_START) {
  leftSeats.push(ARC_START + tileAngle / 2);
}

leftSeats.reverse();

      // RIGHT side: start at aisle edge, place seats going right toward ARC_END
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
          tileW: tw,
          tileH: TILE_H,
          zone: zone.id,
          side: deg < 90 ? "L" : "R",
        };
        seatNum++;
      });
    });
  });
  return map;
}

const POSITION_MAP = buildPositionMap();

// Compute SVG height from deepest row
const deepest = Math.max(...Object.values(POSITION_MAP).map(p => p.y));
const SVG_H = deepest + TILE_H + 60;

function ConcertDetails() {
  const { id }                          = useParams();
  const [seats,         setSeats]       = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip,       setTooltip]     = useState(null);
  const [hovered,       setHovered]     = useState(null);

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

  const getSeatState = (seat) => {
    if (seat.isBooked) return "booked";
    if (selectedSeats.includes(seat.seatNumber)) return "selected";
    return "available";
  };

  const seatMap    = {};
  seats.forEach(s => { seatMap[s.seatNumber] = s; });
  const totalPrice = selectedSeats.reduce((acc, sn) => acc + (seatMap[sn]?.price || 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:radial-gradient(ellipse at 50% 15%, #10102a 0%, #050508 70%); }

        .cd-page    { min-height:100vh; padding:4rem 0 6rem; font-family:'Outfit',sans-serif; }
        .cd-eyebrow { text-align:center; font-size:0.65rem; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:#e8ff47; margin-bottom:0.35rem; }
        .cd-title   { font-family:'Bebas Neue',sans-serif; font-size:2.6rem; letter-spacing:0.08em; color:#fff; text-align:center; margin-bottom:1.2rem; line-height:1; }

        .zone-pills  { display:flex; justify-content:center; flex-wrap:wrap; gap:0.45rem; padding:0 1rem 1.4rem; }
        .zone-pill   { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:0.35rem 0.9rem; font-size:0.7rem; font-weight:600; letter-spacing:0.06em; color:rgba(255,255,255,0.55); }

        .seat-g { cursor:pointer; }
        .seat-g:hover .sr { filter:brightness(1.4) saturate(1.15); }

        .legend      { display:flex; justify-content:center; flex-wrap:wrap; gap:0.9rem; padding:1rem 1.5rem 1.4rem; }
        .legend-item { display:flex; align-items:center; gap:6px; font-size:0.7rem; font-weight:500; color:rgba(255,255,255,0.45); letter-spacing:0.05em; }
        .legend-sq   { width:15px; height:10px; border-radius:3px; flex-shrink:0; }

        .booking-bar   { position:fixed; bottom:0; left:0; right:0; background:rgba(5,5,14,0.97); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.06); padding:0.9rem 2rem; display:flex; align-items:center; justify-content:space-between; z-index:200; flex-wrap:wrap; gap:0.7rem; }
        .booking-seats { display:flex; flex-wrap:wrap; gap:0.35rem; flex:1; min-width:0; }
        .booking-tag   { font-size:0.65rem; font-weight:600; letter-spacing:0.05em; background:rgba(232,255,71,0.1); color:#e8ff47; border:1px solid rgba(232,255,71,0.2); padding:0.2rem 0.5rem; border-radius:2px; }
        .booking-right { display:flex; align-items:center; gap:1.2rem; flex-shrink:0; }
        .booking-total { font-family:'Bebas Neue',sans-serif; font-size:1.7rem; letter-spacing:0.05em; color:#fff; line-height:1; }
        .booking-count { font-size:0.58rem; letter-spacing:0.13em; text-transform:uppercase; color:rgba(255,255,255,0.25); }
        .booking-btn   { font-family:'Outfit',sans-serif; font-size:0.78rem; font-weight:700; letter-spacing:0.11em; text-transform:uppercase; border:none; padding:0.8rem 2.2rem; border-radius:3px; transition:all 0.18s; }
        .booking-btn:not(:disabled) { color:#050508; background:linear-gradient(135deg,#e8ff47,#c4d800); cursor:pointer; box-shadow:0 4px 20px rgba(232,255,71,0.25); }
        .booking-btn:not(:disabled):hover { box-shadow:0 6px 28px rgba(232,255,71,0.42); transform:translateY(-1px); }
        .booking-btn:disabled { color:rgba(255,255,255,0.13); background:rgba(255,255,255,0.04); cursor:not-allowed; }
      `}</style>

      <div className="cd-page">
        <div className="cd-eyebrow">— Choose Your Spot —</div>
        <h1 className="cd-title">Seat Map</h1>

        <div className="zone-pills">
          {ZONES.map(z => (
            <div key={z.id} className="zone-pill">
              <span style={{ width:9,height:9,borderRadius:2,background:z.color.base,flexShrink:0,display:"inline-block" }}/>
              {z.label}
              {seats.find(s => POSITION_MAP[s.seatNumber]?.zone === z.id)?.price &&
                <span style={{ color:z.color.lit }}>
                  · RM{seats.find(s => POSITION_MAP[s.seatNumber]?.zone === z.id).price}
                </span>
              }
            </div>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center", overflowX:"auto", width:"100%" }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            height={SVG_H}
            style={{ display:"block", maxWidth:"100%", height:"auto" }}
          >
            <defs>
              {ZONES.map(z => (
                <linearGradient key={z.id} id={`gz-${z.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={z.color.lit}/>
                  <stop offset="100%" stopColor={z.color.dark}/>
                </linearGradient>
              ))}
              <linearGradient id="gz-selected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8ff90"/><stop offset="100%" stopColor="#9eb000"/>
              </linearGradient>
              <linearGradient id="gz-booked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1e2e"/><stop offset="100%" stopColor="#0d0d18"/>
              </linearGradient>
              <linearGradient id="g-stage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#222000"/><stop offset="100%" stopColor="#080700"/>
              </linearGradient>
              <linearGradient id="g-stage-top" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(232,255,71,0.35)"/>
                <stop offset="100%" stopColor="rgba(232,255,71,0)"/>
              </linearGradient>
              <filter id="f-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="f-stage-glow" x="-40%" y="-80%" width="180%" height="260%">
                <feGaussianBlur stdDeviation="22" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="f-shadow">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.65)"/>
              </filter>
            </defs>

            {/* ── Stage ── */}
            {/* Glow halo behind stage */}
            <rect x={STAGE_X - 18} y={STAGE_Y - 12}
              width={STAGE_W + 36} height={STAGE_H + 24} rx={10}
              fill="rgba(232,255,71,0.08)" filter="url(#f-stage-glow)"/>
            {/* Stage body */}
            <rect x={STAGE_X} y={STAGE_Y} width={STAGE_W} height={STAGE_H} rx={6}
              fill="url(#g-stage)" stroke="#e8ff47" strokeWidth={1.5}/>
            {/* Shine strip */}
            <rect x={STAGE_X + 6} y={STAGE_Y + 5} width={STAGE_W - 12} height={STAGE_H * 0.38} rx={4}
              fill="url(#g-stage-top)"/>
            {/* Outer glow border */}
            <rect x={STAGE_X} y={STAGE_Y} width={STAGE_W} height={STAGE_H} rx={6}
              fill="none" stroke="rgba(232,255,71,0.18)" strokeWidth={7}/>
            {/* Stage text */}
            <text x={SVG_W / 2} y={STAGE_Y + STAGE_H / 2 - 7}
              textAnchor="middle" fill="#e8ff47"
              style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:"0.32em" }}>
              STAGE
            </text>
            <text x={SVG_W / 2} y={STAGE_Y + STAGE_H / 2 + 12}
              textAnchor="middle" fill="rgba(232,255,71,0.55)"
              style={{ fontFamily:"'Outfit',sans-serif", fontSize:14 }}>🎤</text>

            {/* ── Curved aisle guide lines ── */}
            {ZONES.flatMap(z => z.rows.map(({ radius }) => (
              <circle key={z.id + radius} cx={ARC_CX} cy={ARC_CY} r={radius}
                fill="none" stroke={z.color.base} strokeWidth={0.5}
                opacity={0.07} strokeDasharray="4 8"/>
            )))}

            {/* ── Centre aisle markers ── */}
            {ZONES.map(z => {
              const lastRow = z.rows[z.rows.length - 1];
              const firstRow = z.rows[0];
              return (
                <g key={z.id + "-aisle"}>
                  {/* Dashed centre line */}
                  <line
                    x1={ARC_CX} y1={ARC_CY + firstRow.radius - 14}
                    x2={ARC_CX} y2={ARC_CY + lastRow.radius + 14}
                    stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="4 5"/>
                </g>
              );
            })}
            {/* Single continuous aisle line */}
            <line
              x1={ARC_CX}
              y1={ARC_CY + ZONES[0].rows[0].radius - 20}
              x2={ARC_CX}
              y2={ARC_CY + ZONES[ZONES.length-1].rows[ZONES[ZONES.length-1].rows.length-1].radius + 20}
              stroke="rgba(255,255,255,0.08)" strokeWidth={AISLE_W}
            />
            {/* Aisle label */}
            <text x={ARC_CX} y={ARC_CY + ZONES[1].rows[1].radius}
              textAnchor="middle" fill="rgba(255,255,255,0.18)"
              style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:9, letterSpacing:"0.22em" }}>
              AISLE
            </text>

            {/* ── Zone atmosphere arcs ── */}
            {ZONES.map(z => {
              const r1 = z.rows[0].radius - 12;
              const r2 = z.rows[z.rows.length - 1].radius + 12;
              const rMid = (r1 + r2) / 2;
              const thickness = r2 - r1;
              // Draw arc band using stroke on a circle
              const startRad = ARC_START * Math.PI / 180;
              const endRad   = ARC_END   * Math.PI / 180;
              const x1 = ARC_CX + Math.cos(startRad) * rMid;
              const y1 = ARC_CY + Math.sin(startRad) * rMid;
              const x2 = ARC_CX + Math.cos(endRad)   * rMid;
              const y2 = ARC_CY + Math.sin(endRad)   * rMid;
              const largeArc = (ARC_END - ARC_START) > 180 ? 1 : 0;
              return (
                <path key={z.id + "-band"}
                  d={`M ${x1} ${y1} A ${rMid} ${rMid} 0 ${largeArc} 1 ${x2} ${y2}`}
                  fill="none" stroke={z.color.base}
                  strokeWidth={thickness} opacity={0.04}/>
              );
            })}

            {/* ── Seat tiles from backend ── */}
            {seats.map(seat => {
              const pos = POSITION_MAP[seat.seatNumber];
              if (!pos) return null;
              const zone = ZONE_MAP[pos.zone];
              if (!zone) return null;

              const { x, y, deg, tileW: tw = TILE_W, tileH: th = TILE_H } = pos;
              const state    = getSeatState(seat);
              const isBooked = state === "booked";
              const isSel    = state === "selected";
              const isHov    = hovered === seat._id;
              const fillId   = isBooked ? "gz-booked" : isSel ? "gz-selected" : `gz-${pos.zone}`;
              const stroke   = isBooked ? "#1a1a2c" : isSel ? "#e8ff47" : zone.color.border;
              const textFill = isBooked ? "#252540" : isSel ? "#050500" : zone.color.text;
              // Rotate tile to be tangent to the arc
              const rot = `rotate(${deg - 90}, ${x}, ${y})`;
              const numLabel = seat.seatNumber.replace(/^[A-Za-z]+/, "");

              return (
                <g key={seat._id}
                  className={isBooked ? "" : "seat-g"}
                  style={{ cursor: isBooked ? "not-allowed" : "pointer" }}
                  filter={(isSel || isHov) ? "url(#f-glow)" : undefined}
                  opacity={isBooked ? 0.35 : 1}
                  onClick={() => handleSeatClick(seat)}
                  onMouseEnter={() => { if (!isBooked) { setHovered(seat._id); setTooltip({ seat, x, y, zone }); }}}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                >
                  {isSel && (
                    <rect x={x - tw/2 - 3} y={y - th/2 - 3}
                      width={tw + 6} height={th + 6} rx={5}
                      fill="rgba(232,255,71,0.15)" stroke="rgba(232,255,71,0.45)"
                      strokeWidth={1} transform={rot}/>
                  )}
                  <rect className="sr"
                    x={x - tw/2} y={y - th/2}
                    width={tw} height={th} rx={3}
                    fill={`url(#${fillId})`} stroke={stroke} strokeWidth={0.8}
                    filter="url(#f-shadow)" transform={rot}/>
                  {/* Shine */}
                  <rect x={x - tw/2 + 2} y={y - th/2 + 2}
                    width={tw - 4} height={th * 0.37} rx={2}
                    fill="rgba(255,255,255,0.18)" transform={rot}
                    style={{ pointerEvents:"none" }}/>
                  {!isBooked && (
                    <text x={x} y={y + 0.5}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={textFill}
                      style={{ fontFamily:"'Outfit',sans-serif", fontSize: Math.max(6, tw * 0.38), fontWeight:800,
                               pointerEvents:"none", userSelect:"none" }}>
                      {numLabel}
                    </text>
                  )}
                </g>
              );
            })}

            {/* ── Skeleton placeholders while loading ── */}
            {seats.length === 0 && Object.entries(POSITION_MAP).map(([sn, pos]) => {
              const zone = ZONE_MAP[pos.zone];
              const rot  = `rotate(${pos.deg - 90}, ${pos.x}, ${pos.y})`;
              const tw   = pos.tileW || TILE_W;
              const th   = pos.tileH || TILE_H;
              return (
                <rect key={sn}
                  x={pos.x - tw/2} y={pos.y - th/2}
                  width={tw} height={th} rx={3}
                  fill={zone.color.dark} stroke={zone.color.border}
                  strokeWidth={0.5} opacity={0.22} transform={rot}/>
              );
            })}

            {/* ── Row labels ── */}
            {ZONES.flatMap(z => z.rows.map(({ row, radius }) => {
              // Place label to the far left of each row
              const leftEdgeDeg = ARC_START - 4;
              const lx = ARC_CX + Math.cos(leftEdgeDeg * Math.PI / 180) * radius;
              const ly = ARC_CY + Math.sin(leftEdgeDeg * Math.PI / 180) * radius;
              return (
                <text key={row + "-lbl"} x={lx - 6} y={ly + 4}
                  textAnchor="end" dominantBaseline="middle"
                  fill={z.color.base} opacity={0.65}
                  style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:10.5, letterSpacing:"0.06em" }}>
                  {row}
                </text>
              );
            }))}

            {/* ── Zone badges on right edge ── */}
            {ZONES.map(z => {
              const midRow = z.rows[Math.floor(z.rows.length / 2)];
              const rightEdgeDeg = ARC_END + 5;
              const bx = ARC_CX + Math.cos(rightEdgeDeg * Math.PI / 180) * midRow.radius;
              const by = ARC_CY + Math.sin(rightEdgeDeg * Math.PI / 180) * midRow.radius;
              const bw = z.id === "VIP" ? 44 : 56;
              return (
                <g key={z.id + "-badge"}>
                  <rect x={bx} y={by - 9} width={bw} height={18} rx={9}
                    fill={z.color.dark} stroke={z.color.border} strokeWidth={1} opacity={0.9}/>
                  <text x={bx + bw / 2} y={by + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={z.color.lit} opacity={0.95}
                    style={{ fontFamily:"'Outfit',sans-serif", fontSize:8, fontWeight:800, letterSpacing:"0.13em", pointerEvents:"none" }}>
                    {z.id === "VIP" ? "✦ VIP" : z.id}
                  </text>
                </g>
              );
            })}

            {/* ── Entrance arrow at bottom ── */}
            <text x={SVG_W / 2} y={SVG_H - 28}
              textAnchor="middle" fill="rgba(255,255,255,0.4)"
              style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:12, letterSpacing:"0.28em" }}>
              ▲
            </text>
            <text x={SVG_W / 2} y={SVG_H - 12}
              textAnchor="middle" fill="rgba(255,255,255,0.18)"
              style={{ fontFamily:"'Outfit',sans-serif", fontSize:9, fontWeight:700, letterSpacing:"0.24em" }}>
              MAIN ENTRANCE
            </text>

            {/* ── Tooltip ── */}
            {tooltip && (() => {
              const { seat, x, y, zone } = tooltip;
              const W = 104, H = 50;
              const tx = Math.min(Math.max(x, W/2 + 10), SVG_W - W/2 - 10);
              const ty = y - 14;
              return (
                <g style={{ pointerEvents:"none" }}>
                  <rect x={tx-W/2} y={ty-H} width={W} height={H} rx={6}
                    fill="#08081a" stroke={zone.color.border} strokeWidth={1.2} opacity={0.97}/>
                  <rect x={tx-W/2} y={ty-H} width={5} height={H} fill={zone.color.base} opacity={0.85}/>
                  <text x={tx-W/2+12} y={ty-H+14} fill="#fff"
                    style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:14, letterSpacing:"0.08em" }}>
                    Seat {seat.seatNumber}
                  </text>
                  <text x={tx-W/2+12} y={ty-H+28} fill={zone.color.lit}
                    style={{ fontFamily:"'Outfit',sans-serif", fontSize:9, fontWeight:600 }}>
                    {zone.label}
                  </text>
                  {seat.price &&
                    <text x={tx-W/2+12} y={ty-H+41} fill="rgba(255,255,255,0.6)"
                      style={{ fontFamily:"'Outfit',sans-serif", fontSize:9 }}>
                      RM {seat.price.toLocaleString()}
                    </text>
                  }
                </g>
              );
            })()}
          </svg>
        </div>

        <div className="legend">
          {ZONES.map(z => (
            <div key={z.id} className="legend-item">
              <div className="legend-sq" style={{ background:z.color.base, border:`1px solid ${z.color.border}` }}/>
              {z.label}
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-sq" style={{ background:"#1a1a2e", border:"1px solid #252542" }}/>
            Unavailable
          </div>
          <div className="legend-item">
            <div className="legend-sq" style={{ background:"#e8ff47", border:"1px solid #c4d800" }}/>
            Your Selection
          </div>
        </div>
      </div>

      {/* Booking bar */}
      <div className="booking-bar">
        <div className="booking-seats">
          {selectedSeats.length === 0
            ? <span style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.16)", letterSpacing:"0.06em" }}>
                No seats selected — click the map to choose
              </span>
            : selectedSeats.map(sn => <span key={sn} className="booking-tag">{sn}</span>)
          }
        </div>
        <div className="booking-right">
          {selectedSeats.length > 0 && (
            <div>
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
