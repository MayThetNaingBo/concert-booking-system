const Stripe = require("stripe");
const Booking = require("../models/Booking");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {

  try {

    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const session = await stripe.checkout.sessions.create({

      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "sgd",
            product_data: {
              name: "Concert Ticket",
              description: Seats: `${booking.seats.join(", ")}`
            },
            unit_amount: booking.totalPrice * 100
          },
          quantity: 1
        }
      ],

      mode: "payment",

      success_url: `${process.env.CLIENT_URL}/payment-success/${booking._id}`,

      cancel_url: ${process.env.CLIENT_URL}/my-bookings

    });

    res.json({
      url: session.url
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};