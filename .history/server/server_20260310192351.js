require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
const concertRoutes = require("./routes/concertRoutes");

app.use("/api/concerts", concertRoutes);
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/bookings", bookingRoutes);
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));