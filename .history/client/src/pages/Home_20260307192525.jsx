import { useEffect, useState } from "react";
import { getConcerts } from "../services/concertService";
import ConcertCard from "../components/ConcertCard";
import Hero from "../components/hero";

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

    <div className="bg-gray-100 min-h-screen">

      <Hero />

      <div className="p-10">

        <h2 className="text-3xl font-bold mb-8 text-center">
          Upcoming Concerts
        </h2>

        <div className="grid grid-cols-3 gap-8">

          {concerts.map(concert => (
            <ConcertCard
              key={concert._id}
              concert={concert}
            />
          ))}

        </div>

      </div>

    </div>

  );

}

export default Home;