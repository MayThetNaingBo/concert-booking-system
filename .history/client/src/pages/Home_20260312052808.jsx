import { useEffect, useState } from "react";
import { getConcerts } from "../services/concertService";
import ConcertCard from "../components/ConcertCard";
import Hero from "../components/hero";

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchConcerts = async () => {
      const data = await getConcerts();
      setConcerts(data);
    };
    fetchConcerts();
  }, []);

  const filtered = (
  search.trim() === ""
    ? concerts
    : concerts.filter(c => {
        const term = search.toLowerCase();
        return (
          c.name?.toLowerCase().includes(term) ||
          c.title?.toLowerCase().includes(term) ||
          c.artist?.toLowerCase().includes(term) ||
          c.venue?.toLowerCase().includes(term)
        );
      })
).sort((a, b) => new Date(a.date) - new Date(b.date));

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

        /* Search bar */
        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          width: 15px;
          height: 15px;
          opacity: 0.4;
          pointer-events: none;
          color: #fff;
        }

        .search-input {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          padding: 0.65rem 1rem 0.65rem 2.75rem;
          width: 260px;
          outline: none;
          transition: all 0.25s ease;
          caret-color: #e8ff47;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .search-input:focus {
          border-color: rgba(232, 255, 71, 0.6);
          background: rgba(232, 255, 71, 0.04);
          box-shadow: 0 0 0 3px rgba(232, 255, 71, 0.08);
        }

        .search-input:not(:focus) {
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: none;
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          transition: color 0.2s ease;
        }

        .search-clear:hover {
          color: rgba(255,255,255,0.7);
        }

        /* No results */
        .concerts-no-results {
          text-align: center;
          padding: 5rem 2rem;
          font-family: 'Outfit', sans-serif;
        }

        .concerts-no-results-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          color: rgba(255,255,255,0.15);
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }

        .concerts-no-results-sub {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.25);
        }

        .concerts-no-results-sub span {
          color: #e8ff47;
          opacity: 0.7;
        }

        /* Grid */
        .concerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
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
              <div className="concerts-section-title-eyebrow">— Upcoming Shows in Singapore</div>
              <h2 className="concerts-section-title">Upcoming Concerts</h2>
            </div>

            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search concerts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>×</button>
              )}
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
          ) : filtered.length === 0 && search.trim() !== "" ? (
            <div className="concerts-no-results">
              <div className="concerts-no-results-title">No Results Found</div>
              <p className="concerts-no-results-sub">
                No concerts matching <span>"{search}"</span>
              </p>
            </div>
          ) : (
            <div className="concerts-grid">
              {filtered.map(concert => (
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
