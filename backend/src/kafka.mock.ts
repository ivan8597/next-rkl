interface Seat {
  id: number;
  row: string;
  number: number;
  status: string;
}

export async function initKafka(): Promise<void> {
  console.log('Mock Kafka initialized');
  return;
}

export async function sendBookingMessage(seat: Seat): Promise<void> {
  console.log('Mock sending booking message:', seat);
  return;
} 