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
    id: "VIP", label: "VIP Floor",
    rows: [
      { row: "A", radius: 130 },
      { row: "B", radius: 158 },
      { row: "C", radius: 186 },
    ],
    color: { base: "#21ecec", lit: "#76c1ff", dark: "#005d7a", text: "#1a1000", border: "#0040c9" },
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

function polarToXY(deg, radius) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: ARC_CX + Math.cos(rad) * radius,
    y: ARC_CY + Math.sin(rad) * radius,
  };
}

function buildPositionMap() {

  const map = {};

  ZONES.forEach(zone => {

    zone.rows.forEach(({ row, radius, tileW: rowTileW, gap: rowGap }) => {

      const tw = rowTileW !== undefined ? rowTileW : TILE_W;
      const gp = rowGap !== undefined ? rowGap : SEAT_PIX_GAP;

      const degPerPx = 360 / (2 * Math.PI * radius);
      const tileAngle = tw * degPerPx;
      const gapAngle = gp * degPerPx;
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

const deepest = Math.max(...Object.values(POSITION_MAP).map(p => p.y));
const SVG_H = deepest + TILE_H + 60;

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip, setTooltip] = useState(null);

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

  const totalPrice = selectedSeats.reduce((acc, sn) => acc + (seatMap[sn]?.price || 0),
    0
  );

  const handleBooking = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (selectedSeats.length === 0) return;

    try {

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}
        },
        body: JSON.stringify({
          concertId: id,
          seats: selectedSeats,
          totalPrice: totalPrice
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

    }
  };

  return (
    <>
      {/* YOUR ORIGINAL DESIGN BELOW – UNCHANGED */}

      {/* ... SVG seat map code remains exactly the same ... */}

      <div className="booking-bar">
        <div className="booking-seats">
          {selectedSeats.length === 0
            ? <span>No seats selected — click the map to choose</span>
            : selectedSeats.map(sn => <span key={sn}>{sn}</span>)
          }
        </div>

        <div className="booking-right">

          {selectedSeats.length > 0 && (
            <div>
              <div>{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}</div>
              <div>RM {totalPrice.toLocaleString()}</div>
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