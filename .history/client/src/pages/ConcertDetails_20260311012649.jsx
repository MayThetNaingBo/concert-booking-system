import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";
import { socket } from "../socket";

/* ==============================
   STADIUM GEOMETRY CONSTANTS
================================ */

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

/* ==============================
   ZONES
================================ */

const ZONES = [
  {
    id: "VIP",
    label: "VIP Floor",
    price: 300,
    rows: [
      { row: "A", radius: 130 },
      { row: "B", radius: 158 },
      { row: "C", radius: 186 }
    ],
    color: { base: "#21ecec", border: "#0040c9" }
  },
  {
    id: "CAT1",
    label: "Category 1",
    price: 200,
    rows: [
      { row: "D", radius: 222 },
      { row: "E", radius: 250 },
      { row: "F", radius: 278 },
      { row: "G", radius: 306 }
    ],
    color: { base: "#FF5252", border: "#D32F2F" }
  },
  {
    id: "CAT2",
    label: "Category 2",
    price: 120,
    rows: [
      { row: "H", radius: 342 },
      { row: "I", radius: 370 },
      { row: "J", radius: 398 },
      { row: "K", radius: 426 }
    ],
    color: { base: "#00BFA5", border: "#00897B" }
  },
  {
    id: "CAT3",
    label: "Category 3",
    price: 80,
    rows: [
      { row: "L", radius: 462 },
      { row: "M", radius: 490 }
    ],
    color: { base: "#7C4DFF", border: "#5E35B1" }
  }
];

const ZONE_MAP = {};
ZONES.forEach(z => (ZONE_MAP[z.id] = z));

/* ==============================
   SEAT POSITION MATH
================================ */

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

/* ==============================
   COMPONENT
================================ */

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  /* ==============================
     FETCH SEATS
  ================================ */

  useEffect(() => {

    getSeats(id).then(data => {

      if (Array.isArray(data)) setSeats(data);
      else if (data.seats) setSeats(data.seats);
      else setSeats([]);

    });

  }, [id]);

  /* ==============================
     SOCKET REALTIME LISTENERS
  ================================ */

  useEffect(() => {

    socket.on("seatLocked", data => {

      setSeats(prev =>
        prev.map(s =>
          s.seatNumber === data.seatNumber
            ? { ...s, isBooked: true }
            : s
        )
      );

    });

    socket.on("seatUnlocked", data => {

      setSeats(prev =>
        prev.map(s =>
          s.seatNumber === data.seatNumber
            ? { ...s, isBooked: false }
            : s
        )
      );

    });

    return () => {
      socket.off("seatLocked");
      socket.off("seatUnlocked");
    };

  }, []);

  /* ==============================
     SEAT MAP LOOKUP
  ================================ */

  const seatMap = {};
  seats.forEach(s => (seatMap[s.seatNumber] = s));

  /* ==============================
     SEAT CLICK
  ================================ */

  const handleSeatClick = seat => {

    if (seat.isBooked) return;

    setSelectedSeats(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );

  };

  /* ==============================
     TOTAL PRICE
  ================================ */

  const totalPrice = selectedSeats.reduce((acc, seat) => {

    const foundSeat = seats.find(s => s.seatNumber === seat);
    if (!foundSeat) return acc;

    return acc + foundSeat.price;

  }, 0);

  /* ==============================
     BOOKING
  ================================ */

  const handleBooking = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          concertId: id,
          seats: selectedSeats,
          totalPrice
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    selectedSeats.forEach(seatNumber => {
      socket.emit("lockSeat", {
        concertId: id,
        seatNumber
      });
    });

    alert("Seats reserved 🎟");

    setSelectedSeats([]);

  };

  /* ==============================
     UI
  ================================ */

  return (

<div className="min-h-screen bg-gradient-to-b from-black to-slate-900 text-white py-16">

<div className="text-center mb-8">

<p className="uppercase tracking-widest text-lime-300 text-xs">
Choose Your Spot
</p>

<h1 className="text-4xl font-bold">
Concert Seat Map
</h1>

</div>

<div className="flex justify-center overflow-x-auto">

<svg
viewBox={`0 0 ${SVG_W} ${SVG_H}`}
className="max-w-full h-auto"
>

{/* STAGE */}

<rect
x={STAGE_X}
y={STAGE_Y}
width={STAGE_W}
height={STAGE_H}
rx="10"
fill="#111"
/>

<text
x={SVG_W/2}
y={STAGE_Y+40}
textAnchor="middle"
fill="#e8ff47"
className="text-xl font-bold"
>
STAGE
</text>

{/* SEATS */}

{Object.entries(POSITION_MAP).map(([seatNumber,pos])=>{

const seat = seatMap[seatNumber];
if(!seat) return null;

const isBooked = seat.isBooked;
const isSel = selectedSeats.includes(seatNumber);

return(

<g
key={seatNumber}
onClick={()=>handleSeatClick(seat)}
className="cursor-pointer"
>

<rect
x={pos.x - TILE_W/2}
y={pos.y - TILE_H/2}
width={TILE_W}
height={TILE_H}
rx="4"
fill={
isBooked ? "#222"
: isSel ? "#e8ff47"
: "#666"
}
/>

</g>

)

})}

</svg>

</div>

{/* BOOKING BAR */}

<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4 flex justify-between items-center">

<div>

{selectedSeats.length === 0
? "No seats selected"
: selectedSeats.join(", ")
}

</div>

<div className="flex items-center gap-6">

{selectedSeats.length>0 && (

<div className="text-2xl font-bold">
SGD {totalPrice}
</div>

)}

<button
onClick={handleBooking}
disabled={selectedSeats.length===0}
className="bg-lime-300 text-black px-6 py-2 rounded font-semibold disabled:opacity-40"
>

Confirm Booking

</button>

</div>

</div>

</div>

  );

}

export default ConcertDetails;