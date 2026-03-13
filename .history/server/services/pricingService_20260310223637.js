exports.calculateDynamicPrice = (basePrice, concert) => {

  const totalSeats = concert.seats.length;

  const bookedSeats = concert.seats.filter(
    seat => seat.isBooked === true
  ).length;

  const soldRatio = bookedSeats / totalSeats;

  let multiplier = 1;

  if (soldRatio >= 0.8) {
    multiplier = 3;
  } 
  else if (soldRatio >= 0.6) {
    multiplier = 2;
  } 
  else if (soldRatio >= 0.3) {
    multiplier = 1.5;
  }

  return Math.round(basePrice * multiplier);

};