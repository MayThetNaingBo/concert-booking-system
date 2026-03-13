const Concert = require("../models/Concert");

async function generateSeats(concertId) {

  const rows = [
    "A","B","C","D","E","F","G",
    "H","I","J","K","L","M"
  ];

  const seats = [];

  rows.forEach(row => {
    for (let i = 1; i <= 40; i++) {

      let category = "CAT3";
      let price = 80;

      if (["A","B","C"].includes(row)) {
        category = "VIP";
        price = 300;
      }

      else if (["D","E","F","G"].includes(row)) {
        category = "CAT1";
        price = 200;
      }

      else if (["H","I","J","K"].includes(row)) {
        category = "CAT2";
        price = 120;
      }

      seats.push({
        seatNumber: `${row}${i},
        category,
        price,
        isBooked: false
      });

    }
  });

  await Concert.findByIdAndUpdate(concertId, { seats });

  console.log("Seats generated");
}

module.exports = generateSeats;