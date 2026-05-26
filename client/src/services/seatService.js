const API_URL = `${import.meta.env.VITE_API_URL}/api/concerts`;

export const getSeats = async (concertId) => {
  const res = await fetch(`${API_URL}/${concertId}/seats`);
  const data = await res.json();
  return data;
};