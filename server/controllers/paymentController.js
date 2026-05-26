const Stripe = require("stripe");
const crypto = require("crypto");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is not pending" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "sgd",
            product_data: {
              name: "Concert Ticket",
              description: `Seats: ${booking.seats.join(", ")}`,
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      metadata: {
        bookingId: booking._id.toString(),
        userId: booking.user.toString(),
      },

      success_url: `${process.env.CLIENT_URL}/payment-success/${booking._id}`,
      cancel_url: `${process.env.CLIENT_URL}/my-bookings`,
    });

    res.json({
      url: session.url,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        console.log("Booking not found for webhook:", bookingId);
        return res.status(200).json({ received: true });
      }

      if (booking.status === "confirmed") {
        return res.status(200).json({ received: true });
      }

      booking.status = "confirmed";

      if (!booking.qrSecret) {
        booking.qrSecret = crypto.randomBytes(24).toString("hex");
      }

      booking.expiresAt = null;

      await booking.save();

      console.log("Booking confirmed by Stripe webhook:", booking._id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    res.status(500).json({ message: error.message });
  }
};