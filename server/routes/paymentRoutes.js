const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

router.post("/checkout", paymentController.createCheckoutSession);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

module.exports = router;