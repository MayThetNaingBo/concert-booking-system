(acc, sn) => acc + (seatMap[sn]?.price || 0),
    0
  );

  const handleBooking = async () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (selectedSeats.length === 0) return;

    try {

      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: Bearer ${token}
        },
        body: JSON.stringify({
          concertId: id,
          seats: selectedSeats,
          totalPrice: totalPrice
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      alert("Booking successful 🎉");
      setSelectedSeats([]);

    } catch (err) {

      alert("Booking error");

    }
  };

  return (
    <>
      {/* YOUR ORIGINAL DESIGN BELOW – UNCHANGED */}

      {/* ... SVG seat map code remains exactly the same ... */}

      <div className="booking-bar">
        <div className="booking-seats">
          {selectedSeats.length === 0
            ? <span>No seats selected — click the map to choose</span>
            : selectedSeats.map(sn => <span key={sn}>{sn}</span>)
          }
        </div>

        <div className="booking-right">

          {selectedSeats.length > 0 && (
            <div>
              <div>{selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""}</div>
              <div>RM {totalPrice.toLocaleString()}</div>
            </div>
          )}

          <button
            className="booking-btn"
            disabled={selectedSeats.length === 0}
            onClick={handleBooking}
          >
            Confirm Booking →
          </button>

        </div>
      </div>

    </>
  );
}

export default ConcertDetails;