require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:5173",
    /\.vercel\.app$/
],
  credentials: true
}));
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
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});
io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("lockSeat", (data) => {

    io.emit("seatLocked", data);

  });

  socket.on("unlockSeat", (data) => {

    io.emit("seatUnlocked", data);

  });

});
// app.use("/uploads", express.static("uploads"));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});