const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Concert = require("../models/Concert");
const crypto = require("crypto");
const { calculateDynamicPrice } = require("../services/pricingService")


// CREATE BOOKING (Seat Hold)
exports.createBooking = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { concertId, seats } = req.body;

    const concert = await Concert.findById(concertId).session(session);

    if (!concert) {
      throw new Error("Concert not found");
    }

    let totalPrice = 0;

    seats.forEach(seatNumber => {

      const seat = concert.seats.find(
        s => s.seatNumber === seatNumber
      );

      if (!seat || seat.isBooked) {
        throw new Error(`Seat ${seatNumber} unavailable`);
      }

      // AI Dynamic Pricing
      const dynamicPrice = calculateDynamicPrice(
        seat.price,
        concert
      );

      totalPrice += dynamicPrice;

      // lock seat
      seat.isBooked = true;

    });

    await concert.save({ session });

    // HOLD BOOKING FOR 1 MINUTE
    const expiresAt = new Date(Date.now() + 60 * 1000);

    const booking = new Booking({
      user: req.user.id,
      concert: concertId,
      seats,
      totalPrice,
      status: "pending",
      expiresAt
    });

    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Seats reserved for 1 minute",
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
      .populate("user", "name email")
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

    const concert = await Concert.findById(booking.concert);

    // release seats
    booking.seats.forEach(seatNumber => {

      const seat = concert.seats.find(s => s.seatNumber === seatNumber);

      if (seat) {
        seat.isBooked = false;
      }

    });

    await concert.save();

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// CONFIRM BOOKING (After Payment)
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    const concert = await Concert.findById(booking.concert);

    if (!concert) {
      return res.status(404).json({
        message: "Concert not found"
      });
    }

    // If already cancelled
    if (booking.status === "cancelled") {
      // make sure seats are released
      booking.seats.forEach(seatNumber => {
        const seat = concert.seats.find(s => s.seatNumber === seatNumber);
        if (seat) {
          seat.isBooked = false;
        }
      });

      await concert.save();

      return res.status(400).json({
        message: "Booking already expired or cancelled"
      });
    }

    // If expired
    if (booking.expiresAt && new Date() > booking.expiresAt) {
      booking.status = "cancelled";

      booking.seats.forEach(seatNumber => {
        const seat = concert.seats.find(s => s.seatNumber === seatNumber);
        if (seat) {
          seat.isBooked = false;
        }
      });

      await concert.save();
      await booking.save();

      return res.status(400).json({
        message: "Booking expired. Payment cannot be confirmed."
      });
    }

    // Only confirm if still pending
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Booking cannot be confirmed"
      });
    }

    booking.status = "confirmed";

if (!booking.qrSecret) {
  booking.qrSecret = crypto.randomBytes(24).toString("hex");
}

await booking.save();
    res.json({
      message: "Payment successful — booking confirmed",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
exports.getBookingById = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id)
      .populate("concert")
      .populate("user");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found"
      });
    }

    res.json(booking);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
exports.verifyTicket = async (req, res) => {
  try {
    const { id, secret } = req.params;

    const booking = await Booking.findById(id).populate("concert") .populate("user", "name email");

    if (!booking || booking.qrSecret !== secret) {
      return res.status(404).json({
        status: "INVALID",
        message: "Invalid ticket",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        status: "INVALID",
        message: "Ticket is not confirmed",
      });
    }

    if (booking.checkedIn) {
      return res.json({
        status: "USED",
        checkedIn: true,
        checkedInAt: booking.checkedInAt,
        bookingId: booking._id,
        buyerName: booking.user?.name,
buyerEmail: booking.user?.email,
        concertName: booking.concert?.title,
        artist: booking.concert?.artist,
        venue: booking.concert?.venue,
        date: booking.concert?.date,
        startTime: booking.concert?.startTime,
        seats: booking.seats,
      });
    }

    res.json({
      status: "VALID",
      checkedIn: false,
      bookingId: booking._id,
      buyerName: booking.user?.name,
buyerEmail: booking.user?.email,
      concertName: booking.concert?.title,
      artist: booking.concert?.artist,
      venue: booking.concert?.venue,
      date: booking.concert?.date,
      startTime: booking.concert?.startTime,
      seats: booking.seats,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

exports.checkInTicket = async (req, res) => {
  try {
    const { id, secret } = req.params;

    const booking = await Booking.findById(id).populate("concert").populate("user", "name email");

    if (!booking || booking.qrSecret !== secret) {
      return res.status(404).json({
        status: "INVALID",
        message: "Invalid ticket",
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        status: "INVALID",
        message: "Ticket is not confirmed",
      });
    }

    if (booking.checkedIn) {
      return res.status(400).json({
        status: "USED",
        message: "Ticket already used",
        checkedInAt: booking.checkedInAt,
      });
    }

    booking.checkedIn = true;
    booking.checkedInAt = new Date();

    await booking.save();

    res.json({
      status: "CHECKED_IN",
      message: "Ticket checked in successfully",
      checkedInAt: booking.checkedInAt,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};