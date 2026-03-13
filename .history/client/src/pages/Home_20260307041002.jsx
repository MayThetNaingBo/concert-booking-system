import { useEffect, useState } from "react";
import { getConcerts } from "../services/concertService";
import ConcertCard from "../components/ConcertCard";

function Home() {

  const [concerts, setConcerts] = useState([]);

  useEffect(() => {

    const fetchConcerts = async () => {
      const data = await getConcerts();
      setConcerts(data);
    };

    fetchConcerts();

  }, []);

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Concerts
      </h1>

      <div className="grid grid-cols-3 gap-6">

        {concerts.map(concert => (
          <ConcertCard
            key={concert._id}
            concert={concert}
          />
        ))}

      </div>

    </div>

  );

}

export default Home;