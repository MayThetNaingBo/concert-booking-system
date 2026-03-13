const Booking = require("../models/Booking");
const Concert = require("../models/Concert");

exports.createBooking = async (req, res) => {

  const { concertId, seats } = req.body;

  const concert = await Concert.findById(concertId);

  if (!concert) {
    return res.status(404).json({ message: "Concert not found" });
  }

  for (let seat of seats) {

    const seatDoc = concert.seats.find(s => s.seatNumber === seat);

    if (!seatDoc || seatDoc.isBooked) {
      return res.status(400).json({
        message: `Seat ${seat} already booked`
      });
    }

    seatDoc.isBooked = true;

  }

  const totalPrice = seats.length * concert.basePrice;

  const booking = new Booking({
    user: req.user._id,
    concert: concertId,
    seats,
    totalPrice
  });

  await booking.save();
  await concert.save();

  res.json({
    message: "Booking successful",
    booking
  });

};