const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  concert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Concert"
  },

  seats: [String],

  totalPrice: Number,

  bookedAt: {
    type: Date,
    default: Date.now
  },
  status: {
  type: String,
  enum: ["pending", "confirmed", "cancelled"],
  default: "pending"
}

});

module.exports = mongoose.model("Booking", bookingSchema);