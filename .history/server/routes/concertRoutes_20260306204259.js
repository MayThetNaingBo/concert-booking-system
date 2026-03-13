const express = require("express");
const router = express.Router();
const concertController = require("../controllers/concertController");

router.post("/", concertController.createConcert);
router.get("/", concertController.getConcerts);
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.post("/", protect, adminOnly, concertController.createConcert);

module.exports = router;