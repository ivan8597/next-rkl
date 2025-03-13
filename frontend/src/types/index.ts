export interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked';
  type: string;
}