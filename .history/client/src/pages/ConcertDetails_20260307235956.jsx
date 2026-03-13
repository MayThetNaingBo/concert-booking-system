import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSeats } from "../services/seatService";

function ConcertDetails() {

  const { id } = useParams();

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {

    const fetchSeats = async () => {
      const data = await getSeats(id);
      setSeats(data);
    };

    fetchSeats();

  }, [id]);



  const handleSeatClick = (seat) => {

    if (seat.isBooked) return;

    if (selectedSeats.includes(seat.seatNumber)) {

      setSelectedSeats(
        selectedSeats.filter(s => s !== seat.seatNumber)
      );

    } else {

      setSelectedSeats([...selectedSeats, seat.seatNumber]);

    }

  };



  const getSeatColor = (seat) => {

    if (seat.isBooked) {
      return "bg-gray-400 cursor-not-allowed";
    }

    if (selectedSeats.includes(seat.seatNumber)) {
      return "bg-red text-white";
    }

    if (seat.category === "VIP") {
      return "bg-purple-500 text-white hover:bg-purple-600";
    }

    if (seat.category === "CAT1") {
      return "bg-blue-500 text-white hover:bg-blue-600";
    }

    if (seat.category === "CAT2") {
      return "bg-green-500 text-white hover:bg-green-600";
    }

    if (seat.category === "CAT3") {
      return "bg-yellow-400 text-black hover:bg-yellow-500";
    }

  };



  return (

<div className="bg-gray-100 min-h-screen p-10">

<h1 className="text-3xl font-bold text-center mb-8">
Select Your Seats
</h1>


<div className="bg-white p-8 rounded-xl shadow-lg w-fit mx-auto">

<div className="text-center font-bold mb-6 text-lg">
🎤 STAGE
</div>


<div className="grid grid-cols-10 gap-3">

{seats.map((seat) => (

<div
key={seat._id}
onClick={() => handleSeatClick(seat)}
className={`w-10 h-10 flex items-center justify-center rounded text-xs font-semibold cursor-pointer transition ${getSeatColor(seat)}`}
>

{seat.seatNumber}

</div>

))}

</div>


</div>



{/* Legend */}

<div className="mt-8 flex justify-center gap-6 text-sm">

<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-purple-500"></div>
VIP
</div>

<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-blue-500"></div>
CAT1
</div>

<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-green-500"></div>
CAT2
</div>

<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-yellow-400"></div>
CAT3
</div>

<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-gray-400"></div>
Booked
</div>

<div className="flex items-center gap-2">
<div className="w-4 h-4 bg-black"></div>
Selected
</div>

</div>


</div>

  );
}

export default ConcertDetails;