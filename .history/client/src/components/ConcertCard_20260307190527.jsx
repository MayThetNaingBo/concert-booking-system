import { Link } from "react-router-dom";

function ConcertCard({ concert }) {
  return (

    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">

      <div className="p-6">

        <h2 className="text-2xl font-bold mb-2">
          {concert.artist}
        </h2>

        <p className="text-gray-600">
          {concert.venue}
        </p>

        <p className="text-gray-500 mt-2">
          {new Date(concert.date).toLocaleDateString()}
        </p>

        <Link to={`/concert/${concert._id}`}>

          <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">

            View Seats

          </button>

        </Link>

      </div>

    </div>

  );
}

export default ConcertCard;