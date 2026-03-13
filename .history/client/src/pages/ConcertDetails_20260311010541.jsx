import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";
import { socket } from "../socket";

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {

    getSeats(id).then(data => {

      if (Array.isArray(data)) {
        setSeats(data);
      } else if (data.seats) {
        setSeats(data.seats);
      } else {
        setSeats([]);
      }

    });

  }, [id]);



  // SOCKET REALTIME LISTENERS
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



  const totalPrice = selectedSeats.reduce((acc, seat) => {

    const foundSeat = seats.find(s => s.seatNumber === seat);
    if (!foundSeat) return acc;

    return acc + foundSeat.price;

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
          totalPrice
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      // 🔥 Broadcast lock to all users
      selectedSeats.forEach(seatNumber => {

        socket.emit("lockSeat", {
          concertId: id,
          seatNumber
        });

      });

      alert("Seats reserved for 1 minute 🎟");

      setSelectedSeats([]);

    } catch (err) {

      alert("Booking error");

    }

  };



  return (

    <div style={{ padding: "100px 40px", color: "white" }}>

      <h1>Concert Seats</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10,60px)", gap: "10px" }}>

        {seats.map(seat => {

          const isSelected = selectedSeats.includes(seat.seatNumber);

          return (

            <button
              key={seat.seatNumber}
              disabled={seat.isBooked}
              onClick={() => handleSeatClick(seat)}
              style={{
                height: "50px",
                borderRadius: "6px",
                border: "none",
                cursor: seat.isBooked ? "not-allowed" : "pointer",
                background: seat.isBooked
                  ? "#333"
                  : isSelected
                  ? "#e8ff47"
                  : "#555",
                color: isSelected ? "#000" : "#fff"
              }}
            >
              {seat.seatNumber}
            </button>

          );

        })}

      </div>


      <div style={{ marginTop: "30px" }}>

        <h3>Selected Seats:</h3>
        {selectedSeats.join(", ") || "None"}

        <h3>Total Price: SGD {totalPrice}</h3>

        <button
          disabled={selectedSeats.length === 0}
          onClick={handleBooking}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#e8ff47",
            border: "none",
            cursor: "pointer"
          }}
        >
          Confirm Booking
        </button>

      </div>

    </div>

  );

}

export default ConcertDetails;