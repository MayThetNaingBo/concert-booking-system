const API_URL = "https://concert-booking-api.onrender.com/api/concerts";

export const getSeats = async (concertId) => {
  const res = await fetch(`${API_URL}/${concertId}/seats`);
  const data = await res.json();
  return data;
};