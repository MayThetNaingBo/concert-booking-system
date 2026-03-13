import axios from "axios";

const api = axios.create({
  baseURL: "https://concert-booking-api.onrender.com"
});

export default api;