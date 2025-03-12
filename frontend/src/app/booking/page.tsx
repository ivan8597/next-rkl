'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, gql } from '@apollo/client';
import SeatMap from '../../components/SeatMap';
import { subscribeToPush } from '@/lib/client/push';

// Запрос для получения мест
const GET_SEATS = gql`
  query GetSeats($type: String!) {
    seats(type: $type) {
      id
      row
      number
      status
    }
  }
`;

// Мутация для бронирования мест
const BOOK_SEATS = gql`
  mutation BookSeats($seatIds: [Int!]!) {
    bookSeats(seatIds: $seatIds) {
      id
      row
      number
      status
    }
  }
`;

function BookingContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'cinema';
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const { data, loading, error } = useQuery(GET_SEATS, { variables: { type } });
  const [bookSeatsMutation, { loading: bookingLoading, error: bookingError }] = useMutation(BOOK_SEATS);

  useEffect(() => {
    subscribeToPush();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Функция бронирования мест
  async function bookSeats(seats: number[]) {
    if (seats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    try {
      const { data } = await bookSeatsMutation({
        variables: { seatIds: seats },
        // Обновление кэша Apollo после успешного бронирования
        update: (cache, { data: { bookSeats } }) => {
          const existingSeats = cache.readQuery<{ seats: any[] }>({
            query: GET_SEATS,
            variables: { type },
          });

          if (existingSeats) {
            cache.writeQuery({
              query: GET_SEATS,
              variables: { type },
              data: {
                seats: existingSeats.seats.map((seat) =>
                  bookSeats.some((booked: any) => booked.id === seat.id)
                    ? { ...seat, status: 'booked' }
                    : seat
                ),
              },
            });
          }
        },
      });

      if (data?.bookSeats) {
        alert('Seats booked successfully!');
        setSelectedSeats([]); // Очистка выбранных мест после бронирования
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book seats. Please try again.');
    }
  }

  return (
    <div className="container">
      <h1>Booking for {type}</h1>
      <SeatMap seats={data.seats} selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
      <button
        onClick={() => bookSeats(selectedSeats)}
        disabled={bookingLoading || selectedSeats.length === 0}
      >
        {bookingLoading ? 'Booking...' : 'Book Selected Seats'}
      </button>
      {bookingError && <p style={{ color: 'red' }}>Error: {bookingError.message}</p>}
    </div>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}