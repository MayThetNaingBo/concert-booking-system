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
    color: { base: "#21ecec", border: "#0040c9" }
  },
  {
    id: "CAT1", label: "Category 1",
    rows: [
      { row: "D", radius: 222 },
      { row: "E", radius: 250 },
      { row: "F", radius: 278 },
      { row: "G", radius: 306 },
    ],
    color: { base: "#FF5252", border: "#D32F2F" }
  },
  {
    id: "CAT2", label: "Category 2",
    rows: [
      { row: "H", radius: 342 },
      { row: "I", radius: 370 },
      { row: "J", radius: 398 },
      { row: "K", radius: 426 },
    ],
    color: { base: "#00BFA5", border: "#00897B" }
  },
  {
    id: "CAT3", label: "Category 3",
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
          zone: zone.id
        };

        seatNum++;

      });

    });

  });

  return map;
}

const POSITION_MAP = buildPositionMap();

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

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

  const totalPrice = selectedSeats.reduce(
    (acc, sn) => acc + (seatMap[sn]?.price || 0),
    0
  );

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
          Authorization: `Bearer ${token}
        },
        body: JSON.stringify({
          concertId: id,
          seats: selectedSeats,
          totalPrice
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

    <div className="cd-page">

      <svg width={SVG_W} height="650">

        {/* STAGE */}

        <rect
          x={STAGE_X}
          y={STAGE_Y}
          width={STAGE_W}
          height={STAGE_H}
          rx="8"
          fill="#0d0d18"
          stroke="#e8ff47"
          strokeWidth="2"
        />

        <text
          x={SVG_W / 2}
          y={STAGE_Y + STAGE_H / 2 + 5}
          textAnchor="middle"
          fill="#e8ff47"
          style={{ fontFamily: "Bebas Neue", fontSize: "22px", letterSpacing: "0.2em" }}
        >
          STAGE
        </text>

        {/* SEATS */}

        {Object.entries(POSITION_MAP).map(([seatNumber, pos]) => {

          const seat = seatMap[seatNumber];
          if (!seat) return null;

          const zone = ZONE_MAP[pos.zone];

          const fill =
            seat.isBooked
              ? "#1a1a2e"
              : selectedSeats.includes(seatNumber)
              ? "#e8ff47"
              : zone.color.base;

          return (

            <g
              key={seatNumber}
              transform={`translate(${pos.x - 13}, ${pos.y - 10})`}
              onClick={() => handleSeatClick(seat)}
              style={{ cursor: seat.isBooked ? "not-allowed" : "pointer" }}
            >

              <rect
                width="26"
                height="20"
                rx="4"
                fill={fill}
                stroke={zone.color.border}
              />

              <text
                x="13"
                y="13"
                textAnchor="middle"
                fontSize="9"
                fill="#000"
              >
                {seatNumber.replace(/[A-Z]/, "")}
              </text>

            </g>

          );

        })}

      </svg>

      {/* BOOKING BAR */}

      <div className="booking-bar">

        <div className="booking-seats">

          {selectedSeats.length === 0
            ? "No seats selected"
            : selectedSeats.join(", ")}

        </div>

        <div>

          {selectedSeats.length > 0 && (
            <div>
              {selectedSeats.length} seats — RM {totalPrice}
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

    </div>

  );
}

export default ConcertDetails;