import { Link } from "react-router-dom";
import { useState } from "react";

// Generate gradient for fallback banner
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
    fullDay: d.toLocaleString("en-SG", { weekday: "long" }),
    fullMonth: d.toLocaleString("en-SG", { month: "long" }),
  };
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-SG", { hour: "numeric", minute: "2-digit", hour12: true });
}

function ConcertCard({ concert }) {

  const [showModal, setShowModal] = useState(false);

  const { day, date, month, year, fullDay, fullMonth } = formatDate(concert.date);
  const gradient = getArtistGradient(concert.artist);
  const timeStr = formatTime(concert.date);

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
          border-color: rgba(232,255,71,0.2);
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
          background: rgba(232,255,71,0.08);
          border: 1px solid rgba(232,255,71,0.15);
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
        }

        .concert-card-venue {
          font-family: 'Outfit', sans-serif;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.75);
        }

        .concert-card-year {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
        }

        .concert-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 1rem;
        }

        .concert-card-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: #4ade80;
          background: rgba(74,222,128,0.1);
          border: 1px solid rgba(74,222,128,0.2);
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
        }

        .concert-card-btn {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #050508;
          background: #e8ff47;
          padding: 0.55rem 1.25rem;
          border-radius: 2px;
          border: none;
          cursor: pointer;
        }

        /* MODAL STYLES */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .modal-box {
          background: #111114;
          border-radius: 6px;
          width: 360px;
          max-width: 95vw;
          color: white;
          overflow: hidden;
          position: relative;
          font-family: 'Outfit', sans-serif;
        }

        .modal-on-sale-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #e8ff47;
          color: #050508;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
          z-index: 2;
        }

        .modal-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(255,255,255,0.08);
          border: none;
          color: rgba(255,255,255,0.7);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: background 0.2s;
        }

        .modal-close-btn:hover {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        .modal-header {
          padding: 48px 20px 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .modal-artist-initial {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3.2rem;
          line-height: 1;
          color: #fff;
          margin-bottom: 2px;
        }

        .modal-artist-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #e8ff47;
          letter-spacing: 0.04em;
        }

        .modal-description {
          padding: 14px 20px 16px 20px;
          font-size: 0.8rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .modal-details {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .modal-detail-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .modal-detail-icon {
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.06);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .modal-detail-label {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .modal-detail-value {
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(255,255,255,0.88);
        }

        .modal-footer {
          padding: 16px 20px;
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .modal-view-seats-btn {
          flex: 1;
          background: #e8ff47;
          color: #050508;
          border: none;
          padding: 0.75rem 1.25rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border-radius: 3px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .modal-view-seats-btn:hover {
          opacity: 0.9;
        }

        .modal-close-x-btn {
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.6);
          border-radius: 3px;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          flex-shrink: 0;
        }

        .modal-close-x-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #fff;
        }

      `}</style>

      {/* CARD */}
      <div className="concert-card" onClick={() => setShowModal(true)}>

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

            <Link
              to={`/concert/${concert._id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="concert-card-btn">
                View Seats →
              </button>
            </Link>

          </div>

        </div>

      </div>

      {/* MODAL */}
      {showModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >

          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >

            {/* On Sale badge */}
            <span className="modal-on-sale-badge">ON SALE NOW</span>

            {/* Top-right close */}
            <button
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            {/* Header: artist initial + name */}
            <div className="modal-header">
              <div className="modal-artist-initial">
                {concert.artist.charAt(0)}
              </div>
              <div className="modal-artist-name">{concert.artist}</div>
            </div>

            {/* Description */}
            {concert.description && (
              <div className="modal-description">
                {concert.description}
              </div>
            )}

            {/* Date / Time / Venue details */}
            <div className="modal-details">

              <div className="modal-detail-row">
                <div className="modal-detail-icon">📅</div>
                <div>
                  <div className="modal-detail-label">Date</div>
                  <div className="modal-detail-value">
                    {fullDay}, {fullMonth} {date}, {year}
                  </div>
                </div>
              </div>

              <div className="modal-detail-row">
                <div className="modal-detail-icon">🕐</div>
                <div>
                  <div className="modal-detail-label">Time</div>
                  <div className="modal-detail-value">{timeStr}</div>
                </div>
              </div>

              <div className="modal-detail-row">
                <div className="modal-detail-icon">📍</div>
                <div>
                  <div className="modal-detail-label">Venue</div>
                  <div className="modal-detail-value">{concert.venue}</div>
                </div>
              </div>

            </div>

            {/* Footer actions */}
            <div className="modal-footer">
              <Link
                to={`/concert/${concert._id}`}
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1 }}
              >
                <button className="modal-view-seats-btn">
                  VIEW SEATS →
                </button>
              </Link>

              <button
                className="modal-close-x-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default ConcertCard;
