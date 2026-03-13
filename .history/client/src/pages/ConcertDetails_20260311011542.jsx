import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";
import { socket } from "../socket";

const SVG_W = 1000;

const ZONES = [
  {
    id: "VIP",
    label: "VIP Floor",
    price: 300,
    rows: ["A","B","C"],
    color: "#21ecec"
  },
  {
    id: "CAT1",
    label: "Category 1",
    price: 200,
    rows: ["D","E","F","G"],
    color: "#FF5252"
  },
  {
    id: "CAT2",
    label: "Category 2",
    price: 120,
    rows: ["H","I","J","K"],
    color: "#00BFA5"
  },
  {
    id: "CAT3",
    label: "Category 3",
    price: 80,
    rows: ["L","M"],
    color: "#7C4DFF"
  }
];

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // fetch seats
  useEffect(() => {

    getSeats(id).then(data => {

      if (Array.isArray(data)) setSeats(data);
      else if (data.seats) setSeats(data.seats);
      else setSeats([]);

    });

  }, [id]);



  // socket realtime listeners
  useEffect(() => {

    socket.on("seatLocked", (data) => {

      setSeats(prev =>
        prev.map(s =>
          s.seatNumber === data.seatNumber
            ? { ...s, isBooked: true }
            : s
        )
      );

    });

    socket.on("seatUnlocked", (data) => {

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



  const handleSeatClick = (seat) => {

    if (seat.isBooked) return;

    setSelectedSeats(prev =>
      prev.includes(seat.seatNumber)
        ? prev.filter(s => s !== seat.seatNumber)
        : [...prev, seat.seatNumber]
    );

  };



  const totalPrice = selectedSeats.reduce((acc, sn) => {

    const seat = seats.find(s => s.seatNumber === sn);
    if (!seat) return acc;

    return acc + seat.price;

  }, 0);



  const handleBooking = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {

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
        alert(data.message || "Booking failed");
        return;
      }

      // broadcast seat locks
      selectedSeats.forEach(seatNumber => {

        socket.emit("lockSeat", {
          concertId: id,
          seatNumber
        });

      });

      alert("Seats reserved for 1 minute 🎟");

      setSelectedSeats([]);

    } catch (error) {

      alert("Booking error");

    }

  };



  return (

    <div style={{
      minHeight:"100vh",
      background:"#050508",
      color:"white",
      padding:"100px 40px"
    }}>

      <h1 style={{
        fontFamily:"Bebas Neue",
        fontSize:"3rem",
        letterSpacing:"0.08em",
        textAlign:"center"
      }}>
        Concert Seat Map
      </h1>



      {/* SEAT GRID */}
      <div style={{
        marginTop:"50px",
        display:"grid",
        gridTemplateColumns:"repeat(20,40px)",
        gap:"10px",
        justifyContent:"center"
      }}>

        {seats.map(seat => {

          const selected = selectedSeats.includes(seat.seatNumber);

          return (

            <button
              key={seat.seatNumber}
              disabled={seat.isBooked}
              onClick={() => handleSeatClick(seat)}
              onMouseEnter={() => setHovered(seat.seatNumber)}
              onMouseLeave={() => setHovered(null)}
              style={{
                height:"35px",
                borderRadius:"6px",
                border:"none",
                cursor:seat.isBooked ? "not-allowed" : "pointer",
                background:
                  seat.isBooked
                  ? "#1a1a2e"
                  : selected
                  ? "#e8ff47"
                  : "#555",
                color:selected ? "#000" : "#fff",
                fontSize:"11px",
                fontWeight:"600"
              }}
            >
              {seat.seatNumber}
            </button>

          );

        })}

      </div>



      {/* BOOKING BAR */}
      <div style={{
        position:"fixed",
        bottom:0,
        left:0,
        right:0,
        background:"#050508",
        borderTop:"1px solid rgba(255,255,255,0.08)",
        padding:"20px",
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center"
      }}>

        <div>

          {selectedSeats.length === 0
            ? "No seats selected"
            : selectedSeats.join(", ")
          }

        </div>

        <div style={{display:"flex",gap:"20px",alignItems:"center"}}>

          {selectedSeats.length > 0 && (

            <div style={{
              fontFamily:"Bebas Neue",
              fontSize:"1.8rem"
            }}>
              SGD {totalPrice}
            </div>

          )}

          <button
            disabled={selectedSeats.length === 0}
            onClick={handleBooking}
            style={{
              background:"#e8ff47",
              border:"none",
              padding:"10px 24px",
              fontWeight:"700",
              cursor:"pointer"
            }}
          >
            Confirm Booking
          </button>

        </div>

      </div>

    </div>

  );

}

export default ConcertDetails;