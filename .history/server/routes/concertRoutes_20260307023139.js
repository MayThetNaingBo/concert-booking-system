const express = require("express");
const router = express.Router();

const concertController = require("../controllers/concertController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.post("/", protect, adminOnly, concertController.createConcert);

router.get("/", concertController.getConcerts);
router.get("/:id/seats", concertController.getSeats);

module.exports = router;