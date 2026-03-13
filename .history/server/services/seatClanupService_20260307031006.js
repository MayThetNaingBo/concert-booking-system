exports.releaseExpiredLocks = (concert) => {

  const now = new Date();

  concert.seats.forEach(seat => {

    if (seat.lockedUntil && seat.lockedUntil < now) {
      seat.lockedUntil = null;
    }

  });

};