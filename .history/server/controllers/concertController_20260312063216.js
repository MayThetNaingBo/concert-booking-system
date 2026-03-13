const Concert = require("../models/Concert");
const { releaseExpiredBookings } = require("../services/seatCleanupService");


// CREATE CONCERT (ADMIN)
exports.createConcert = async (req, res) => {

  try {

    const {
      title,
      artist,
      venue,
      date,
      startTime,
      description,
      vipPrice,
      cat1Price,
      cat2Price,
      cat3Price
    } = req.body;


    // ⭐ Prevent duplicate concerts on same venue + same day
    const concertDate = new Date(date);

    const startOfDay = new Date(concertDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(concertDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingConcert = await Concert.findOne({
      venue,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingConcert) {
      return res.status(400).json({
        message: "A concert already exists at this venue on this date."
      });
    }


    const seats = [];

    const rows = [
      { row: "A", seats: 20, category: "VIP", price: vipPrice },
      { row: "B", seats: 40, category: "VIP", price: vipPrice },
      { row: "C", seats: 40, category: "VIP", price: vipPrice },

      { row: "D", seats: 40, category: "CAT1", price: cat1Price },
      { row: "E", seats: 30, category: "CAT1", price: cat1Price },
      { row: "F", seats: 30, category: "CAT1", price: cat1Price },
      { row: "G", seats: 30, category: "CAT1", price: cat1Price },

      { row: "H", seats: 30, category: "CAT2", price: cat2Price },
      { row: "I", seats: 30, category: "CAT2", price: cat2Price },
      { row: "J", seats: 30, category: "CAT2", price: cat2Price },
      { row: "K", seats: 30, category: "CAT2", price: cat2Price },

      { row: "L", seats: 40, category: "CAT3", price: cat3Price },
      { row: "M", seats: 40, category: "CAT3", price: cat3Price },
    ];


    rows.forEach(section => {

      for (let i = 1; i <= section.seats; i++) {

        seats.push({
          seatNumber: `${section.row}${i}`,
          category: section.category,
          price: section.price,
          isBooked: false,
          lockedUntil: null
        });

      }

    });


    const concert = new Concert({
      title,
      artist,
      venue,
      date: new Date(date),   // ⭐ store properly
      startTime,
      description,
      image: req.file ? req.file.path : null,
      seats
    });


    await concert.save();


    res.status(201).json({
      message: "Concert created successfully",
      totalSeats: seats.length,
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

    console.error("Get concerts error:", error);

    res.status(500).json({
      message: error.message
    });

  }

};



// GET SEATS FOR A CONCERT
exports.getSeats = async (req, res) => {

  try {

    // release expired seat holds first
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