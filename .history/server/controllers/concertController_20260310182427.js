const Concert = require("../models/Concert");
const { releaseExpiredBookings } = require("../services/seatCleanupService");


// CREATE CONCERT
exports.createConcert = async (req, res) => {

  try {

    const { artist, venue, date } = req.body;

    const seats = [];

    const rows = [
      { row: "A", seats: 20, category: "VIP", price: 300 },
      { row: "B", seats: 40, category: "VIP", price: 300 },
      { row: "C", seats: 40, category: "VIP", price: 300 },

      { row: "D", seats: 40, category: "CAT1", price: 200 },
      { row: "E", seats: 30, category: "CAT1", price: 200 },
      { row: "F", seats: 30, category: "CAT1", price: 200 },
      { row: "G", seats: 30, category: "CAT1", price: 200 },

      { row: "H", seats: 30, category: "CAT2", price: 120 },
      { row: "I", seats: 30, category: "CAT2", price: 120 },
      { row: "J", seats: 30, category: "CAT2", price: 120 },
      { row: "K", seats: 30, category: "CAT2", price: 120 },

      { row: "L", seats: 40, category: "CAT3", price: 80 },
      { row: "M", seats: 40, category: "CAT3", price: 80 },
    ];

    rows.forEach(section => {

      for (let i = 1; i <= section.seats; i++) {

        seats.push({
          seatNumber: ${section.row}${i},
          category: section.category,
          price: section.price,
          isBooked: false,
          lockedUntil: null
        });

      }

    });

    const concert = new Concert({
      artist,
      venue,
      date,
      seats
    });

    await concert.save();

    res.status(201).json({
      message: "Concert created",
      concert
    });

  } catch (error) {

    console.error("Create concert error:", error);

    res.status(500).json({
      message: error.message
    });

  }

};



// GET ALL CONCERTS
exports.getConcerts = async (req, res) => {

  try {

    const concerts = await Concert.find();

    res.json(concerts);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



// GET SEATS
exports.getSeats = async (req, res) => {

  try {

    // release expired seat holds
    await releaseExpiredBookings();

    const concert = await Concert.findById(req.params.id);

    if (!concert) {
      return res.status(404).json({
        message: "Concert not found"
      });
    }

    res.json(concert.seats);

  } catch (error) {

    console.error("Seat fetch error:", error);

    res.status(500).json({
      message: error.message
    });

  }

};