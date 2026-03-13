const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Concert = require("../models/Concert");
const { calculateDynamicPrice } = require("../services/pricingService")



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