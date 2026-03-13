function ConcertCard({ concert }) {
  return (
    <div className="bg-white shadow p-4 rounded">

      <h2 className="text-xl font-bold">
        {concert.artist}
      </h2>

      <p>{concert.venue}</p>

      <p>
        {new Date(concert.date).toLocaleDateString()}
      </p>

      <button className="bg-blue-600 text-white px-4 py-2 mt-3 rounded">
        View Seats
      </button>

    </div>
  );
}

export default ConcertCard;