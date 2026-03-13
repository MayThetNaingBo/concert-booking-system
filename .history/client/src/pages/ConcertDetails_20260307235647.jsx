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


  // GROUP SEATS BY CATEGORY
  const vipSeats = seats.filter(seat => seat.category === "VIP");
  const cat1Seats = seats.filter(seat => seat.category === "CAT1");
  const cat2Seats = seats.filter(seat => seat.category === "CAT2");
  const cat3Seats = seats.filter(seat => seat.category === "CAT3");


  const renderSeats = (seatArray) => {

    return seatArray.map((seat) => (

      <div
        key={seat._id}
        className={`w-10 h-10 flex items-center justify-center rounded text-sm cursor-pointer
          ${
            seat.isBooked
              ? "bg-red-500 text-white"
              : "bg-green-500 text-white hover:bg-green-600"
          }
        `}
      >
        {seat.seatNumber}
      </div>

    ));

  };


  return (

<div className="bg-gray-100 min-h-screen p-10">

  <h1 className="text-3xl font-bold mb-6 text-center">
    Select Your Seats
  </h1>

  <div className="bg-white p-8 rounded-xl shadow-md w-fit mx-auto">

    <div className="text-center font-bold mb-6">
      🎤 STAGE
    </div>

    {/* VIP */}
    <h2 className="font-bold text-purple-600 mb-2">VIP</h2>
    <div className="grid grid-cols-10 gap-3 mb-6">
      {renderSeats(vipSeats)}
    </div>

    {/* CAT1 */}
    <h2 className="font-bold text-blue-600 mb-2">CAT1</h2>
    <div className="grid grid-cols-10 gap-3 mb-6">
      {renderSeats(cat1Seats)}
    </div>

    {/* CAT2 */}
    <h2 className="font-bold text-green-600 mb-2">CAT2</h2>
    <div className="grid grid-cols-10 gap-3 mb-6">
      {renderSeats(cat2Seats)}
    </div>

    {/* CAT3 */}
    <h2 className="font-bold text-yellow-600 mb-2">CAT3</h2>
    <div className="grid grid-cols-10 gap-3">
      {renderSeats(cat3Seats)}
    </div>

  </div>

</div>

  );
}

export default ConcertDetails;