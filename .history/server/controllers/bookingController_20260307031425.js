const Booking = require("../models/Booking");
const Concert = require("../models/Concert");
const { calculateDynamicPrice } = require("../services/pricingService");
const { releaseExpiredLocks } = require("../services/seatCleanupService");

exports.createBooking = async (req, res) => {

  try {

    const { concertId, seats } = req.body;

  const concert = await Concert.findById(concertId);

if (!concert) {
  return res.status(404).json({
    message: "Concert not found"
  });
}

// release expired seat locks
releaseExpiredLocks(concert);

    
    const unavailableSeats = [];

const now = new Date();

for (let seat of seats) {

  const seatDoc = concert.seats.find(s => s.seatNumber === seat);

  if (!seatDoc) {
    unavailableSeats.push(seat);
    continue;
  }

  const seatLocked =
    seatDoc.lockedUntil && seatDoc.lockedUntil > now;

  if (seatDoc.isBooked || seatLocked) {
    unavailableSeats.push(seat);
  }

}

if (unavailableSeats.length > 0) {
  return res.status(400).json({
    message: "Some seats are unavailable",
    unavailableSeats
  });
}

// If all seats are available → book them
for (let seat of seats) {

  const seatDoc = concert.seats.find(s => s.seatNumber === seat);
  seatDoc.lockedUntil = new Date(Date.now() + 3 * 60 * 1000);

}

    const { dynamicPrice, totalPrice } =
      calculateDynamicPrice(concert, seats.length);

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
      pricePerTicket: dynamicPrice,
      totalPrice,
      booking
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


exports.getMyBookings = async (req, res) => {

  try {

    const bookings = await Booking.find({
      user: req.user._id
    }).populate("concert");

    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

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

      const seatDoc = concert.seats.find(
        s => s.seatNumber === seat
      );

      if (seatDoc) {
        seatDoc.isBooked = false;
seatDoc.lockedUntil = null;
      }

    });

    await concert.save();
    await booking.deleteOne();

    res.json({
      message: "Booking cancelled successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
exports.confirmBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const concert = await Concert.findById(booking.concert);

    booking.status = "confirmed";

    booking.seats.forEach(seat => {

      const seatDoc = concert.seats.find(
        s => s.seatNumber === seat
      );

      if (seatDoc) {
        seatDoc.isBooked = true;
        seatDoc.lockedUntil = null;
      }

    });

    await concert.save();
    await booking.save();

    res.json({
      message: "Booking confirmed successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};