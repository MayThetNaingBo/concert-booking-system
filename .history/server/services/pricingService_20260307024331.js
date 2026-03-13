exports.calculateDynamicPrice = (concert, seatsRequested) => {

  const totalSeats = concert.seats.length;

  const bookedSeats = concert.seats.filter(s => s.isBooked).length;

  const remainingSeats = totalSeats - bookedSeats;

  let priceMultiplier = 1;

  const remainingPercentage = remainingSeats / totalSeats;

  if (remainingPercentage < 0.10) {
    priceMultiplier = 2; // +100%
  } 
  else if (remainingPercentage < 0.20) {
    priceMultiplier = 1.5; // +50%
  } 
  else if (remainingPercentage < 0.50) {
    priceMultiplier = 1.2; // +20%
  }

  const dynamicPrice = concert.basePrice * priceMultiplier;

  const totalPrice = dynamicPrice * seatsRequested;

  return {
    dynamicPrice,
    totalPrice
  };

};