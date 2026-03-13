exports.calculateDynamicPrice = (concert, selectedSeats) => {

  const totalSeats = concert.seats.length;

  const bookedSeats = concert.seats.filter(
    seat => seat.isBooked
  ).length;

  const demand = bookedSeats / totalSeats;

  let multiplier = 1;

  if (demand > 0.7) multiplier = 1.3;
  else if (demand > 0.5) multiplier = 1.2;
  else if (demand > 0.3) multiplier = 1.1;

  let totalPrice = 0;

  selectedSeats.forEach(seatNumber => {

    const seat = concert.seats.find(
      s => s.seatNumber === seatNumber
    );

    totalPrice += seat.price * multiplier;

  });

  return {
    multiplier,
    totalPrice
  };

};