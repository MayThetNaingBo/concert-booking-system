const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, bookingController.createBooking);
router.get("/myBookings", protect, bookingController.getMyBookings);
router.delete("/:id", protect, bookingController.cancelBooking);
router.post("/confirm/:id", protect, bookingController.confirmBooking);
router.get("/:id", protect, bookingController.getBo)

module.exports = router;