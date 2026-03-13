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

    <div className="bg-gray-100 min-h-screen p-10">

      <h1 className="text-3xl font-bold mb-6">
        Select Your Seats
      </h1>

      <div className="grid grid-cols-10 gap-3">

        {seats.map((seat) => (

          <div
            key={seat._id}
            className={`p-3 text-center rounded cursor-pointer
              ${seat.isBooked
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
              }
            `}
          >
            {seat.seatNumber}
          </div>

        ))}

      </div>

    </div>

  );
}

export default ConcertDetails;