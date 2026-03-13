import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

const SVG_W = 960;
const SVG_H = 720;
const CX = SVG_W / 2;
const CY = 360;

// Zone configuration
const ZONES = {
  VIP:  { radius: 140, color: "#a855f7", label: "VIP" },
  CAT1: { radius: 190, color: "#3b82f6", label: "Category 1" },
  CAT2: { radius: 240, color: "#10b981", label: "Category 2" },
  CAT3: { radius: 290, color: "#eab308", label: "Category 3" }
};

// Stadium arc (not full circle)
const START_ANGLE = -150 * (Math.PI / 180);
const END_ANGLE   =  150 * (Math.PI / 180);

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getSeats(id);
      setSeats(data);
    };
    fetchSeats();
  }, [id]);

  const handleSeatClick = (seat) => {
    if (seat.isBooked) return;

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seat.seatNumber]);
    }
  };

  // Group seats by category
  const seatsByCategory = {
    VIP: [],
    CAT1: [],
    CAT2: [],
    CAT3: []
  };

  seats.forEach(seat => {
    if (seatsByCategory[seat.category]) {
      seatsByCategory[seat.category].push(seat);
    }
  });

  const renderSeats = (category) => {

    const zone = ZONES[category];
    const zoneSeats = seatsByCategory[category];

    const angleStep =
      (END_ANGLE - START_ANGLE) / Math.max(zoneSeats.length - 1, 1);

    return zoneSeats.map((seat, i) => {

      const angle = START_ANGLE + i * angleStep;

      const x = CX + Math.cos(angle) * zone.radius;
      const y = CY + Math.sin(angle) * zone.radius;

      let fill = zone.color;

      if (seat.isBooked) fill = "#6b7280";
      if (selectedSeats.includes(seat.seatNumber)) fill = "#e8ff47";

      return (
        <g
          key={seat._id}
          onClick={() => handleSeatClick(seat)}
          style={{ cursor: seat.isBooked ? "not-allowed" : "pointer" }}
        >
          <circle
            cx={x}
            cy={y}
            r={10}
            fill={fill}
            stroke="#111"
            strokeWidth="1"
          />
          <text
            x={x}
            y={y + 3}
            textAnchor="middle"
            fontSize="8"
            fill="#000"
            fontWeight="bold"
          >
            {seat.seatNumber}
          </text>
        </g>
      );
    });
  };

  const totalPrice = selectedSeats.reduce((sum, sn) => {
    const seat = seats.find(s => s.seatNumber === sn);
    return sum + (seat?.price || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">

      <h1 className="text-3xl font-bold mt-6 mb-6">Select Your Seats</h1>

      <svg width={SVG_W} height={SVG_H}>

        {/* Stage */}
        <ellipse cx={CX} cy={CY} rx={90} ry={70} fill="#111" stroke="#e8ff47" />
        <text
          x={CX}
          y={CY}
          textAnchor="middle"
          fill="#e8ff47"
          fontSize="16"
          fontWeight="bold"
        >
          STAGE
        </text>

        {/* Seats */}
        {renderSeats("VIP")}
        {renderSeats("CAT1")}
        {renderSeats("CAT2")}
        {renderSeats("CAT3")}

      </svg>

      {/* Legend */}
      <div className="flex gap-6 mt-4">
        {Object.entries(ZONES).map(([k,v]) => (
          <div key={k} className="flex items-center gap-2">
            <div
              style={{ background:v.color, width:14, height:14 }}
            />
            {v.label}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div style={{ background:"#6b7280", width:14, height:14 }} />
          Booked
        </div>
      </div>

      {/* Booking Bar */}
      <div className="fixed bottom-0 w-full bg-gray-900 p-4 flex justify-between items-center">

        <div></div>