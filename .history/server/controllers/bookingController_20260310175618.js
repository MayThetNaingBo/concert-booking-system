const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Concert = require("../models/Concert");


// CREATE BOOKING
exports.createBooking = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { concertId, seats, totalPrice } = req.body;

    const concert = await Concert.findById(concertId).session(session);

    if (!concert) {
      throw new Error("Concert not found");
    }

    // check and lock seats
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
      totalPrice,
      status: "confirmed"
    });

    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Booking successful",
      booking
    });

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    session.endSession();

    res.status(400).json({
      message: error.message
    });

  }

};



// GET USER BOOKINGS
exports.getMyBookings = async (req, res) => {

  try {

    const bookings = await Booking.find({ user: req.user.id })
      .populate("concert")
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    // release seats
    const concert = await Concert.findById(booking.concert);

    booking.seats.forEach(seatNumber => {

      const seat = concert.seats.find(s => s.seatNumber === seatNumber);

      if (seat) {
        seat.isBooked = false;
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



// CONFIRM BOOKING (optional endpoint)
exports.confirmBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({
      message: "Booking confirmed",
      booking
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};