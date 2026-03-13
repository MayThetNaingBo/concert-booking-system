const Concert = require("../models/Concert");
const { releaseExpiredBookings } = require("../services/seatCleanupService");


// CREATE CONCERT (ADMIN)




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