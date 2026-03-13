import { useEffect, useState } from "react";
import { getConcerts } from "../services/concertService";
import ConcertCard from "../components/ConcertCard";
import Hero from "../components/hero";

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchConcerts = async () => {
      const data = await getConcerts();
      setConcerts(data);
    };
    fetchConcerts();
  }, []);

 

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #050508;
          color: #fff;
        }

        .home {
          background: #050508;
          min-height: 100vh;
        }

        /* Section */
        .concerts-section {
          padding: 6rem 2.5rem 5rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .concerts-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .concerts-section-title-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #e8ff47;
          margin-bottom: 0.5rem;
        }

        .concerts-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          letter-spacing: 0.04em;
          color: #fff;
          line-height: 1;
        }

        /* Filter tabs */
        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          padding: 0.5rem 1.1rem;
          border-radius: 2px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-tab:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.85);
        }

        .filter-tab.active {
          background: #e8ff47;
          color: #050508;
          border-color: #e8ff47;
          font-weight: 600;
        }

        /* Grid */
        .concerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        /* Empty state */
        .concerts-empty {
          text-align: center;
          padding: 5rem 2rem;
          color: rgba(255,255,255,0.3);
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
        }

        /* Loading skeleton */
        .skeleton-card {
          border-radius: 4px;
          overflow: hidden;
          background: #0d0d12;
          border: 1px solid rgba(255,255,255,0.07);
        }

        .skeleton-banner {
          height: 160px;
          background: linear-gradient(90deg, #111118 25%, #1a1a24 50%, #111118 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-body {
          padding: 1.25rem;
        }

        .skeleton-line {
          height: 14px;
          border-radius: 2px;
          background: linear-gradient(90deg, #111118 25%, #1a1a24 50%, #111118 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          margin-bottom: 0.75rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Divider line */
        .section-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          margin-bottom: 4rem;
        }
      `}</style>

      <div className="home">
        <Hero />

        <div className="concerts-section">
          <div className="section-divider" />

          <div className="concerts-section-header">
            <div>
              <div className="concerts-section-title-eyebrow">— Upcoming Shows</div>
              <h2 className="concerts-section-title">Upcoming Concerts</h2>
            </div>

            <div className="filter-tabs">
              {genres.map(g => (
                <button
                  key={g}
                  className={`filter-tab${filter === g ? " active" : ""}`}
                  onClick={() => setFilter(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {concerts.length === 0 ? (
            <div className="concerts-grid">
              {[1, 2, 3].map(i => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-banner" />
                  <div className="skeleton-body">
                    <div className="skeleton-line" style={{ width: "60%" }} />
                    <div className="skeleton-line" style={{ width: "80%" }} />
                    <div className="skeleton-line" style={{ width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="concerts-grid">
              {concerts.map(concert => (
                <ConcertCard key={concert._id} concert={concert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
