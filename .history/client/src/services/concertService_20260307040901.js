import api from "../api/axios";

export const getConcerts = async () => {
  const res = await api.get("/concerts");
  return res.data;
};