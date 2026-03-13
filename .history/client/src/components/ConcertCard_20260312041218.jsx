import { useState } from "react";

const concerts = [
  {
    id: 1,
    title: "V",
    artist: "Kim Taehyung",
    description:
      "Experience an intimate solo performance from BTS member V as he takes the stage for his highly anticipated world tour. An evening of soulful vocals, stunning visuals, and unforgettable music.",
    date: "Sunday, November 15, 2026",
    time: "7:30 PM",
    venue: "Singapore National Stadium",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/V_BTS_at_2019_Melon_Music_Awards.jpg/800px-V_BTS_at_2019_Melon_Music_Awards.jpg",
    tag: "On Sale",
  },
];

export default function ConcertHub() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0d",
      fontFamily: "'DM Sans', sans-serif",
      color: "#fff",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px", borderBottom: "1px solid #1e1e1e",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#c8f135", fontSize: 20 }}>•</span>
          <span style={{ fontFamily: "'Bebas Neue'", letterSpacing: 3, fontSize: 18 }}>CONCERTHUB</span>
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 13, color: "#888" }}>
          <span style={{ color: "#fff", cursor: "pointer" }}>HOME</span>
          <span style={{ cursor: "pointer" }}>SIGN IN</span>
          <span style={{ cursor: "pointer" }}>SIGN UP</span>
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding: "48px 48px 24px" }}>
        <p style={{ color: "#c8f135", fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>— UPCOMING SHOWS IN SINGAPORE</p>
        <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: 52, letterSpacing: 4, margin: 0 }}>UPCOMING CONCERTS</h1>
      </div>

      {/* Concert Cards */}
      <div style={{ padding: "0 48px", display: "flex", gap: 20, flexWrap: "wrap" }}>
        {concerts.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(c)}
            style={{
              width: 260, background: "#1a1a1a", borderRadius: 4,
              overflow: "hidden", cursor: "pointer",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <div style={{ height: 200, background: "#333", position: "relative", overflow: "hidden" }}>
              <img src={c.image} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.6)" }} />
              <div style={{ position: "absolute", bottom: 12, left: 16, fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2 }}>{c.title}</div>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <div style={{ textAlign: "center", background: "#222", padding: "4px 10px", borderRadius: 3 }}>
                  <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>SUN</div>
                  <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1 }}>15</div>
                  <div style={{ fontSize: 9, color: "#888", letterSpacing: 2 }}>NOV</div>
                </div>
                <div style={{ fontSize: 12, color: "#aaa" }}>📍 {c.venue}</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "#c8f135", color: "#000", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 2, letterSpacing: 1 }}>ON SALE</span>
                <button
                  style={{ background: "#2a2a2a", border: "1px solid #444", color: "#fff", padding: "6px 14px", fontSize: 11, cursor: "pointer", borderRadius: 2 }}
                  onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                >
                  View Seats →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP OVERLAY */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Wide Rectangular Popup */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              width: "min(900px, 95vw)",
              minHeight: 380,
              background: "#141414",
              border: "1px solid #2a2a2a",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
              animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {/* LEFT: Text Content */}
            <div style={{
              flex: 1,
              padding: "44px 48px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderRight: "1px solid #222",
            }}>
              <div>
                {/* Tag */}
                <span style={{
                  background: "#c8f135", color: "#000",
                  fontSize: 10, fontWeight: 700,
                  padding: "4px 10px", borderRadius: 2,
                  letterSpacing: 1.5, display: "inline-block", marginBottom: 20,
                }}>
                  ON SALE NOW
                </span>

                {/* Title */}
                <h2 style={{
                  fontFamily: "'Bebas Neue'",
                  fontSize: 64,
                  letterSpacing: 4,
                  margin: "0 0 4px",
                  lineHeight: 1,
                }}>{selected.title}</h2>
                <p style={{ color: "#c8f135", fontSize: 13, letterSpacing: 2, margin: "0 0 24px" }}>{selected.artist}</p>

                {/* Description */}
                <p style={{
                  color: "#999", fontSize: 14, lineHeight: 1.8,
                  maxWidth: 380, margin: "0 0 32px",
                }}>{selected.description}</p>

                {/* Date, Time & Venue */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>📅</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 2 }}>DATE</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{selected.date}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>🕐</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 2 }}>TIME</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{selected.time}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 18 }}>📍</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 2 }}>VENUE</div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{selected.venue}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", gap: 12 }}>
                <button style={{
                  background: "#c8f135", color: "#000",
                  border: "none", padding: "14px 32px",
                  fontWeight: 700, fontSize: 13, letterSpacing: 1.5,
                  cursor: "pointer", borderRadius: 3,
                }}>
                  VIEW SEATS →
                </button>
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    background: "transparent", color: "#666",
                    border: "1px solid #333", padding: "14px 20px",
                    fontSize: 13, cursor: "pointer", borderRadius: 3,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* RIGHT: Image */}
            <div style={{
              width: 320,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
            }}>
              <img
                src={selected.image}
                alt={selected.title}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  objectPosition: "top",
                  display: "block",
                }}
              />
              {/* Gradient overlay on left edge of image */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to right, #141414 0%, transparent 30%)",
                pointerEvents: "none",
              }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
