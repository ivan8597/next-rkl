export async function initRedis() {
  return;
}

export async function bookSeat(seatId) {
  return {
    id: seatId,
    row: 'A',
    number: seatId,
    status: 'booked'
  };
} 