const Booking = require("../models/Booking");
const Concert = require("../models/Concert");

exports.createBooking = async (req, res) => {

  try {

    const { concertId, quantity } = req.body;

    const concert = await Concert.findById(concertId);

    if (!concert) {
      return res.status(404).json({ message: "Concert not found" });
    }

    if (concert.ticketsAvailable < quantity) {
      return res.status(400).json({ message: "Not enough tickets" });
    }

    const totalPrice = concert.basePrice * quantity;

    const booking = new Booking({
      user: req.user.id,
      concert: concertId,
      quantity,
      totalPrice
    });

    await booking.save();

    concert.ticketsAvailable -= quantity;
    await concert.save();

    res.status(201).json({
      message: "Booking successful",
      booking
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};
exports.getMyBookings = async (req, res) => {
  try {

    const bookings = await Booking.find({ user: req.user.id })
      .populate("concert");

    res.json(bookings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};