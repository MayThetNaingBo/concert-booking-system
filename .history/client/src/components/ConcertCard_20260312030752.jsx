import { Link } from "react-router-dom";
import { useState } from "react";
// Generate a deterministic gradient based on artist name
function getArtistGradient(name = "") {
  const gradients = [
    "linear-gradient(135deg, #1a0533 0%, #6b21a8 50%, #ec4899 100%)",
    "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0ea5e9 100%)",
    "linear-gradient(135deg, #1a0a00 0%, #7c2d12 50%, #f97316 100%)",
    "linear-gradient(135deg, #0a0f1a 0%, #14532d 50%, #4ade80 100%)",
    "linear-gradient(135deg, #1a0010 0%, #831843 50%, #f43f5e 100%)",
    "linear-gradient(135deg, #050520 0%, #312e81 50%, #818cf8 100%)",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleString("en-SG", { weekday: "short" }).toUpperCase(),
    date: d.getDate(),
    month: d.toLocaleString("en-SG", { month: "short" }).toUpperCase(),
    year: d.getFullYear(),
  };
}

function ConcertCard({ concert }) {
  const [showModal, setshowModal] = useState
  const { day, date, month, year } = formatDate(concert.date);
  const gradient = getArtistGradient(concert.artist);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .concert-card {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          background: #0d0d12;
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
        }

        .concert-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.6);
          border-color: rgba(232, 255, 71, 0.2);
        }

        .concert-card-banner {
          height: 160px;
          position: relative;
          overflow: hidden;
        }

        .concert-card-banner-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .concert-card:hover .concert-card-banner-bg {
          transform: scale(1.06);
        }

        .concert-card-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(13,13,18,0.9) 100%);
        }

        .concert-card-banner-artist {
          position: absolute;
          bottom: 1rem;
          left: 1.25rem;
          right: 1.25rem;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.06em;
          color: #fff;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        .concert-card-body {
          padding: 1.25rem;
        }

        .concert-card-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.25rem;
        }

        .concert-card-date-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(232, 255, 71, 0.08);
          border: 1px solid rgba(232, 255, 71, 0.15);
          border-radius: 3px;
          padding: 0.5rem 0.75rem;
          min-width: 56px;
        }

        .concert-card-date-day {
          font-family: 'Outfit', sans-serif;
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: #e8ff47;
        }

        .concert-card-date-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          line-height: 1;
          color: #fff;
        }

        .concert-card-date-month {
          font-family: 'Outfit', sans-serif;
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.5);
        }

        .concert-card-info {
          flex: 1;
          min-width: 0;
        }

        .concert-card-venue {
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .concert-card-year {
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          margin-top: 2px;
        }

        .concert-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 1rem;
        }

        .concert-card-badge {
          font-family: 'Outfit', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4ade80;
          background: rgba(74, 222, 128, 0.1);
          border: 1px solid rgba(74, 222, 128, 0.2);
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
        }

        .concert-card-btn {
          font-family: 'Outfit', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #050508;
          background: #e8ff47;
          padding: 0.55rem 1.25rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s ease;
        }

        .concert-card-btn:hover {
          background: #f5ff8a;
          box-shadow: 0 4px 20px rgba(232, 255, 71, 0.35);
          transform: translateY(-1px);
        }
      `}</style>

      <div className="concert-card">
        <div className="concert-card-banner">

          {concert.image ? (
            <img
              src={concert.image}
              alt={concert.artist}
              className="concert-card-banner-bg"
            />
          ) : (
            <div
              className="concert-card-banner-bg"
              style={{ background: gradient }}
            />
          )}

          <div className="concert-card-banner-overlay" />
          <div className="concert-card-banner-artist">{concert.artist}</div>
        </div>

        <div className="concert-card-body">
          <div className="concert-card-meta">
            <div className="concert-card-date-box">
              <span className="concert-card-date-day">{day}</span>
              <span className="concert-card-date-num">{date}</span>
              <span className="concert-card-date-month">{month}</span>
            </div>
            <div className="concert-card-info">
              <div className="concert-card-venue">📍 {concert.venue}</div>
              <div className="concert-card-year">{year}</div>
            </div>
          </div>

          <div className="concert-card-footer">
            <span className="concert-card-badge">On Sale</span>
            <Link to={`/concert/${concert._id}`}>
              <button className="concert-card-btn">View Seats →</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConcertCard;