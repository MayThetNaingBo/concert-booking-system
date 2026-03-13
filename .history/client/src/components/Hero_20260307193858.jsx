function Hero() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #050508;
          padding-top: 68px;
        }

        /* Atmospheric background layers */
        .hero-bg-glow-1 {
          position: absolute;
          top: -10%;
          left: -5%;
          width: 60%;
          height: 70%;
          background: radial-gradient(ellipse at center, rgba(120, 60, 220, 0.22) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-bg-glow-2 {
          position: absolute;
          bottom: 0;
          right: -10%;
          width: 55%;
          height: 60%;
          background: radial-gradient(ellipse at center, rgba(232, 255, 71, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-bg-glow-3 {
          position: absolute;
          top: 30%;
          left: 40%;
          width: 40%;
          height: 50%;
          background: radial-gradient(ellipse at center, rgba(255, 80, 120, 0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Noise texture overlay */
        .hero-noise {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* Horizontal scan lines */
        .hero-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.012) 2px,
            rgba(255,255,255,0.012) 4px
          );
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 900px;
          padding: 0 2rem;
          animation: heroFadeIn 1.2s ease forwards;
        }

        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #e8ff47;
          margin-bottom: 1.5rem;
          animation: heroFadeIn 1.2s ease 0.1s both;
        }

        .hero-label-line {
          display: inline-block;
          width: 30px;
          height: 1px;
          background: #e8ff47;
        }

        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4.5rem, 12vw, 10rem);
          line-height: 0.92;
          letter-spacing: 0.02em;
          color: #fff;
          margin-bottom: 1.5rem;
          animation: heroFadeIn 1.2s ease 0.2s both;
        }

        .hero-title-highlight {
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(232, 255, 71, 0.7);
          display: block;
        }

        .hero-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.03em;
          max-width: 500px;
          margin: 0 auto 3rem;
          animation: heroFadeIn 1.2s ease 0.3s both;
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          animation: heroFadeIn 1.2s ease 0.4s both;
          flex-wrap: wrap;
        }

        .hero-btn-primary {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #050508;
          background: #e8ff47;
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .hero-btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.2);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .hero-btn-primary:hover::before {
          transform: translateX(0);
        }

        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(232, 255, 71, 0.3);
        }

        .hero-btn-secondary {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 1rem 2.5rem;
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .hero-btn-secondary:hover {
          border-color: rgba(255,255,255,0.4);
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        /* Stats row */
        .hero-stats {
          position: absolute;
          bottom: 3.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4rem;
          z-index: 10;
          animation: heroFadeIn 1.2s ease 0.6s both;
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.05em;
          color: #fff;
          display: block;
        }

        .hero-stat-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }

        .hero-stat-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
          align-self: stretch;
        }

        /* Decorative corner marks */
        .hero-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          z-index: 5;
          opacity: 0.3;
        }
        .hero-corner-tl { top: 90px; left: 24px; border-top: 1px solid #e8ff47; border-left: 1px solid #e8ff47; }
        .hero-corner-br { bottom: 24px; right: 24px; border-bottom: 1px solid #e8ff47; border-right: 1px solid #e8ff47; }
      `}</style>

      <div className="hero">
        <div className="hero-bg-glow-1" />
        <div className="hero-bg-glow-2" />
        <div className="hero-bg-glow-3" />
        <div className="hero-noise" />
        <div className="hero-scanlines" />

        <div className="hero-corner hero-corner-tl" />
        <div className="hero-corner hero-corner-br" />

        <div className="hero-content">
          <div className="hero-label">
            <span className="hero-label-line" />
            Live Events · Singapore
            <span className="hero-label-line" />
          </div>

          <h1 className="hero-title">
            Feel The
            <span className="hero-title-highlight">Music</span>
          </h1>

          <p className="hero-subtitle">
            Discover and book tickets to the world's greatest live performances, right here in Singapore.
          </p>

          <div className="hero-actions">
            <button className="hero-btn-primary">Browse Events</button>
            <button className="hero-btn-secondary">View Calendar</button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">200+</span>
            <span className="hero-stat-label">Events</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">50K+</span>
            <span className="hero-stat-label">Tickets Sold</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">99%</span>
            <span className="hero-stat-label">Happy Fans</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Hero;
