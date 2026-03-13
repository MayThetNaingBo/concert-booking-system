const API_URL = "http://localhost:5000/api/concerts";

export const getSeats = async (concertId) => {
  const res = await fetch(`${API_URL}/${concertId}/seats`);
  const data = await res.json();
  return data;
};