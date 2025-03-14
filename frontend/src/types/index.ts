export interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked';
  type: string;
  price: number;
  category: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}