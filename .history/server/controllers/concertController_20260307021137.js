const Concert = require("../models/Concert");
exports.createConcert = async (req, res) => {

  const { artist, venue, date, basePrice } = req.body;

  const seats = [];

  const rows = ["A","B","C","D"];
  const seatsPerRow = 10;

  rows.forEach(row => {
    for (let i = 1; i <= seatsPerRow; i++) {
      seats.push({
        seatNumber: `${row}${i}`,
        isBooked: false
      });
    }
  });

  const concert = new Concert({
    artist,
    venue,
    date,
    basePrice,
    seats
  });

  await concert.save();

  res.json(concert);
};