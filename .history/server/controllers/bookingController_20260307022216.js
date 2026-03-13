const Booking = require("../models/Booking");
const Concert = require("../models/Concert");

exports.createBooking = async (req, res) => {
  try {

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

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMyBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({
      user: req.user._id
    }).populate("concert");

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.cancelBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const concert = await Concert.findById(booking.concert);

    booking.seats.forEach(seat => {

      const seatDoc = concert.seats.find(s => s.seatNumber === seat);

      if (seatDoc) {
        seatDoc.isBooked = false;
      }

    });

    await concert.save();
    await booking.deleteOne();

    res.json({
      message: "Booking cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};