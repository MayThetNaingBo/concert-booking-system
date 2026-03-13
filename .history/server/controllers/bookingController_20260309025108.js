const Booking = require("../models/Booking");
const Concert = require("../models/Concert");
const { calculateDynamicPrice } = require("../services/pricingService");
const { releaseExpiredLocks } = require("../services/seatCleanupService");

exports.createBooking = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { concertId, seats, totalPrice } = req.body;

    const concert = await Concert.findById(concertId).session(session);

    if (!concert) {
      throw new Error("Concert not found");
    }

    seats.forEach(seatNumber => {

      const seat = concert.seats.find(s => s.seatNumber === seatNumber);

      if (!seat || seat.isBooked) {
        throw new Error(`Seat ${seatNumber} unavailable`);
      }

      seat.isBooked = true;

    });

    await concert.save({ session });

    const booking = new Booking({
      user: req.user.id,
      concert: concertId,
      seats,
      totalPrice
    });

    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Booking successful",
      booking
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      message: error.message
    });

  }

};