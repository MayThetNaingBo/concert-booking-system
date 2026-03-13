import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getSeats(id);
      setSeats(data);
    };

    fetchSeats();
  }, [id]);

  /* ---------------- SEAT CLICK ---------------- */

  const handleSeatClick = (seat) => {

    if (seat.isBooked) return;

    if (selectedSeats.includes(seat.seatNumber)) {

      setSelectedSeats(
        selectedSeats.filter(s => s !== seat.seatNumber)
      );

    } else {

      setSelectedSeats([...selectedSeats, seat.seatNumber]);

    }
  };

  /* ---------------- PRICE CALCULATION ---------------- */

  const totalPrice = selectedSeats.reduce((sum, seatNumber) => {

    const seat = seats.find(s => s.seatNumber === seatNumber);

    return sum + (seat?.price || 0);

  }, 0);

  /* ---------------- BOOKING ---------------- */

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

    } catch (error) {

      alert("Booking error");

    }

  };

  /* ---------------- SEAT COLOR ---------------- */

  const getSeatColor = (seat) => {

    if (seat.isBooked) return "#1a1a2e";

    if (selectedSeats.includes(seat.seatNumber)) return "#e8ff47";

    if (seat.category === "VIP") return "#9b5cff";

    if (seat.category === "CAT1") return "#3c82f6";

    if (seat.category === "CAT2") return "#22c55e";

    if (seat.category === "CAT3") return "#ef4444";

    return "#555";

  };

  /* ---------------- SVG SEAT MAP ---------------- */

  return (
    <>

      <div className="seat-container">

        <svg width="900" height="650">

          {seats.map((seat, i) => {

            const angle = (i * 360) / seats.length;

            const radius = 260;

            const cx = 450 + radius * Math.cos(angle * Math.PI / 180);
            const cy = 300 + radius * Math.sin(angle * Math.PI / 180);

            return (

              <g key={seat._id}>

                <rect
                  x={cx}
                  y={cy}
                  width="18"
                  height="18"
                  rx="3"
                  fill={getSeatColor(seat)}
                  stroke="#000"
                  onClick={() => handleSeatClick(seat)}
                  style={{ cursor: seat.isBooked ? "not-allowed" : "pointer" }}
                  onMouseEnter={() => setTooltip({ seat, x: cx, y: cy })}
                  onMouseLeave={() => setTooltip(null)}
                />

                <text
                  x={cx + 9}
                  y={cy + 12}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#fff"
                >
                  {seat.seatNumber}
                </text>

              </g>

            );

          })}

        </svg>

      </div>

      {/* -------- Legend -------- */}

      <div className="legend">

        <div>🟪 VIP</div>
        <div>🟦 CAT1</div>
        <div>🟩 CAT2</div>
        <div>🟥 CAT3</div>
        <div>⬛ Booked</div>
        <div>🟨 Selected</div>

      </div>

      {/* -------- Booking Bar -------- */}<div className="booking-bar">

        <div className="booking-seats">

          {selectedSeats.length === 0
            ? "No seats selected"
            : selectedSeats.join(", ")}

        </div>

        <div className="booking-right">

          {selectedSeats.length > 0 && (
            <div>

              <div>
                {selectedSeats.length} seat
                {selectedSeats.length > 1 ? "s" : ""}
              </div>

              <div>
                RM {totalPrice.toLocaleString()}
              </div>

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