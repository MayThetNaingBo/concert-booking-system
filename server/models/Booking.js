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
  enum: ["pending", "confirmed", "cancelled", "refunded"],
  default: "pending",
},

expiresAt: Date,

qrSecret: {
  type: String,
  unique: true,
  sparse: true,
},

checkedIn: {
  type: Boolean,
  default: false,
},

checkedInAt: Date,

  qrSecret: {
  type: String,
  unique: true,
  sparse: true
},

checkedIn: {
  type: Boolean,
  default: false
},

checkedInAt: Date
}, {timestamps:true});

module.exports = mongoose.model("Booking", bookingSchema);