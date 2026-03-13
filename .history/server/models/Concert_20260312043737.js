const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({

  seatNumber: String,

  category: String,

  price: Number,

  isBooked: {
    type: Boolean,
    default: false
  },

  lockedUntil: {
    type: Date,
    default: null
  }

});

const concertSchema = new mongoose.Schema({

  artist: String,
  venue: String,
  date: Date,
  startTime: String,
  description: 
  image: String,
  seats: [seatSchema]

});

module.exports = mongoose.model("Concert", concertSchema);