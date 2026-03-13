const Booking = require("../models/Booking");
const Concert = require("../models/Concert");

exports.releaseExpiredBookings = async () => {

  const expiredBookings = await Booking.find({
    status: "held",
    expiresAt: { $lt: new Date() }
  });

  for (const booking of expiredBookings) {

    const concert = await Concert.findById(booking.concert);

    booking.seats.forEach(seatNumber => {

      const seat = concert.seats.find(s => s.seatNumber === seatNumber);

      if (seat) seat.isBooked = false;

    });

    await concert.save();

    booking.status = "cancelled";
    await booking.save();

  }

};