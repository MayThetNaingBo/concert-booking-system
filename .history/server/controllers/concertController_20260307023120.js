const Concert = require("../models/Concert");

// Create concert (Admin)
exports.createConcert = async (req, res) => {
  try {
    const { artist, venue, date, basePrice, ticketsAvailable } = req.body;

    const concert = new Concert({
      artist,
      venue,
      date,
      basePrice,
      ticketsAvailable
    });

    await concert.save();

    res.status(201).json({
      message: "Concert created successfully",
      concert
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all concerts (Client)
exports.getConcerts = async (req, res) => {
  try {

    const concerts = await Concert.find();

    res.json(concerts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get seat map for a concert
exports.getSeats = async (req, res) => {
  try {

    const concert = await Concert.findById(req.params.id);

    if (!concert) {
      return res.status(404).json({
        message: "Concert not found"
      });
    }

    res.json(concert.seats);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};