export const createBooking = async (concertId, seats, token) => {
  const res = await fetch("http://localhost:5000/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}
    },
    body: JSON.stringify({
      concertId,
      seats
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Booking failed");
  }

  return data;
};