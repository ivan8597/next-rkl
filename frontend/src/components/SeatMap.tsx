'use client';

import React from 'react';
import { Seat as SeatType } from '../types';

interface SeatMapProps {
  seats: SeatType[];
  selectedSeats: number[];
  setSelectedSeats: (seats: number[]) => void;
}

export default function SeatMap({ seats, selectedSeats, setSelectedSeats }: SeatMapProps) {
  const toggleSeat = (seatId: number) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="seat-map">
      {seats.map((seat) => (
        <div
          key={seat.id}
          className={`seat ${seat.status === 'booked' ? 'booked' : ''} ${
            selectedSeats.includes(seat.id) ? 'selected' : ''
          }`}
          onClick={() => seat.status !== 'booked' && toggleSeat(seat.id)}
        >
          {seat.row}-{seat.number}
        </div>
      ))}
    </div>
  );
}