'use client';

import React from 'react';
import { Seat as SeatType } from '../types';

interface SeatMapProps {
  seats: SeatType[];
  selectedSeats: string[]; // Обновляем тип на string[]
  setSelectedSeats: (seats: string[]) => void; // Обновляем тип на string[]
}

export default function SeatMap({ seats, selectedSeats, setSelectedSeats }: SeatMapProps) {
  const handleSeatClick = (seat: SeatType) => {
    if (seat.status === 'booked') return;
    
    if (!selectedSeats.includes(seat.id)) {
      if (selectedSeats.length >= 4) {
        alert('Можно выбрать не более 4 мест');
        return;
      }
      setSelectedSeats([...selectedSeats, seat.id]);
    } else {
      setSelectedSeats(selectedSeats.filter(id => id !== seat.id));
    }
  };

  // Преобразуем числовые row в буквенные (1 -> A, 2 -> B, 3 -> C и т.д.)
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
  const getRowLabel = (rowNumber: number) => rowLabels[rowNumber - 1] || rowNumber.toString();

  return (
    <div className="seat-map">
      {seats
        .reduce((uniqueRows, seat) => {
          const rowLabel = getRowLabel(seat.row);
          if (!uniqueRows.includes(rowLabel)) uniqueRows.push(rowLabel);
          return uniqueRows;
        }, [] as string[])
        .map((rowLabel) => (
          <div key={rowLabel} className="seat-row flex gap-2 my-2">
            <div className="row-label">{rowLabel}</div>
            {seats
              .filter((seat) => getRowLabel(seat.row) === rowLabel)
              .map((seat) => (
                <button
                  key={seat.id}
                  className={`seat ${
                    seat.status === 'booked'
                      ? 'bg-red-500'
                      : selectedSeats.includes(seat.id)
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                  } cursor-pointer p-4 rounded`}
                  onClick={() => seat.status !== 'booked' && handleSeatClick(seat)}
                  data-cy={`seat-${seat.status}`}
                  disabled={seat.status === 'booked'}
                  aria-label={`Место ${seat.number}, ряд ${rowLabel}`}
                >
                  {seat.number}
                </button>
              ))}
          </div>
        ))}
    </div>
  );
}

