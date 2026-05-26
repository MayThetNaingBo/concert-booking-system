export const createBooking = async (concertId, seats, token) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
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