import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);

  useEffect(() => {

    const fetchSeats = async () => {

      const data = await getSeats(id);
      setSeats(data);

    };

    fetchSeats();

  }, [id]);

  return (

    

export default ConcertDetails;