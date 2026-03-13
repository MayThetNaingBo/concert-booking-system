import { useEffect, useState } from "react";

function MyBookings() {

  const [bookings, setBookings] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/bookings/myBookings", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setBookings(data));

  }, []);

  return (
    <div>

      <h2>My Bookings</h2>

      {bookings.map(b => (
        <div key={b._id}>

          <p>Concert: {b.concert.artist}</p>
          <p>Seats: {b.seats.join(", ")}</p>
          <p>Status: {b.status}</p>

        </div>
      ))}

    </div>
  );
}

export default MyBookings;