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
      if (selectedSeats.length >= 4) {
        alert('You can only select up to 4 seats at once');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <div className="seat-map">
      {['A', 'B', 'C'].map(row => (
        <div key={row} className="seat-row">
          <div className="row-label">{row}</div>
          {seats
            .filter(seat => seat.row === row)
            .map((seat) => (
              <div
                key={seat.id}
                className={`seat ${seat.status === 'booked' ? 'booked' : ''} ${
                  selectedSeats.includes(seat.id) ? 'selected' : ''
                }`}
                onClick={() => seat.status !== 'booked' && toggleSeat(seat.id)}
              >
                {seat.number}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}