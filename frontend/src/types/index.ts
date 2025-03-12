export interface Seat {
  id: number;
  row: string;
  number: number;
  status: 'available' | 'booked';
}