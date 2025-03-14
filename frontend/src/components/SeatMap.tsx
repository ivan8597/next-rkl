'use client';

import React from 'react';
import { Seat as SeatType } from '../types/index';

interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked';
  type?: string;
  price?: number;
  category?: string;
}

interface SeatMapProps {
  seats: SeatType[];
  selectedSeats: string[]; 
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

  
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
  const getRowLabel = (rowNumber: number) => rowLabels[rowNumber - 1] || rowNumber.toString();

  return (
    <div className="seat-map">
      <div className="legend flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200"></div>
          <span>Эконом</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200"></div>
          <span>Стандарт</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200"></div>
          <span>VIP</span>
        </div>
      </div>
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
                      : seat.category === 'vip'
                      ? 'bg-green-200'
                      : seat.category === 'standard'
                      ? 'bg-blue-200'
                      : 'bg-red-200'
                  } cursor-pointer p-4 rounded`}
                  onClick={() => seat.status !== 'booked' && handleSeatClick(seat)}
                  data-cy={`seat-${seat.status}`}
                  disabled={seat.status === 'booked'}
                  aria-label={`Место ${seat.number}, ряд ${rowLabel}, категория ${seat.category}, цена ${seat.price}`}
                >
                  <div>{seat.number}</div>
                  <div className="text-xs">{seat.price}₽</div>
                </button>
              ))}
          </div>
        ))}
    </div>
  );
}

