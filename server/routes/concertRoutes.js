const express = require("express");
const router = express.Router();

const concertController = require("../controllers/concertController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  concertController.createConcert
);

router.get("/", concertController.getConcerts);
router.get("/:id", concertController.getConcertById);
router.get("/:id/seats", concertController.getSeats);

module.exports = router;