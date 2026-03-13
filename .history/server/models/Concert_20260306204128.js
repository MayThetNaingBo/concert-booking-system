const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  ticketsAvailable: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Concert", concertSchema);