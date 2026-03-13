const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema({

  artist: String,
  venue: String,
  date: Date,
  basePrice: Number,

  seats: [
    {
      seatNumber: String,
      isBooked: {
        type: Boolean,
        default: false
      }
    }
  ]

});

module.exports = mongoose.model("Concert", concertSchema);