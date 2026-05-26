const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
router.post("/", protect, bookingController.createBooking);
router.get("/myBookings", protect, bookingController.getMyBookings);
router.delete("/:id", protect, bookingController.cancelBooking);
router.post("/confirm/:id", protect, bookingController.confirmBooking);
router.get("/verify/:id/:secret", bookingController.verifyTicket);
router.get("/:id", protect, bookingController.getBookingById);
router.post("/check-in/:id/:secret", protect, adminOnly, bookingController.checkInTicket);

module.exports = router;