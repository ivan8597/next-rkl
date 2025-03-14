export interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked';
  type: string;
  price: number;
  category: 'standard' | 'vip' | 'economy';
}