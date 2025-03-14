'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import SeatMap from '../../components/SeatMap';
import { subscribeToPush } from '@/lib/client/push';
import { client } from '@/components/Providers';

// Запрос для получения мест
const GET_SEATS = gql`
  query GetSeats($type: String!) {
    seats(type: $type) {
      id
      row
      number
      status
      price
      category
      type
    }
  }
`;

// Мутация для бронирования мест
const BOOK_SEATS = gql`
  mutation BookSeats($seatIds: [String!]!, $type: String!) {
    bookSeats(seatIds: $seatIds, type: $type) {
      id
      row
      number
      status
      price
      category
      type
    }
  }
`;

// Подписка на обновления мест
const SEAT_SUBSCRIPTION = gql`
  subscription SeatUpdated($type: String!) {
    seatUpdated(type: $type) {
      id
      row
      number
      status
      price
      category
      type
    }
  }
`;

function BookingContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'cinema';
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_SEATS, {
    variables: { type },
    fetchPolicy: 'network-only', // Всегда запрашивать данные с сервера, игнорируя кэш
    notifyOnNetworkStatusChange: true, // Обновлять состояние при изменении данных
  });

  const [bookSeatsMutation, { loading: bookingLoading, error: bookingError }] = useMutation(BOOK_SEATS);

  // Подписываемся на обновления мест
  useSubscription(SEAT_SUBSCRIPTION, {
    variables: { type },
    onData: ({ data }) => {
      if (data.data?.seatUpdated) {
        // Обновляем кэш Apollo с новыми данными
        const updatedSeat = data.data.seatUpdated;
        const cache = client.cache;
        
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
                seat.id === updatedSeat.id ? updatedSeat : seat
              ),
            },
          });
        }
      }
    },
  });

  useEffect(() => {
    subscribeToPush();
    refetch(); // Обновляем данные при изменении type
    setSelectedSeats([]);
  }, [type, refetch]);

  if (loading) return <p>Пожалуйста, подождите...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  async function bookSeats(seats: string[]) {
    if (seats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    try {
      const { data } = await bookSeatsMutation({
        variables: { seatIds: seats, type },
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
        alert('Места успешно забронированы!');
        setSelectedSeats([]);
        refetch(); // Обновляем данные после бронирования
      }
    } catch (err) {
      console.error('Booking error:', err);
      alert('Failed to book seats. Please try again.');
    }
  }

  return (
    <div className="container">
      <h1>Booking for {type}</h1>
      <SeatMap seats={data?.seats || []} selectedSeats={selectedSeats} setSelectedSeats={setSelectedSeats} />
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
    <Suspense fallback={<div>Пожалуйста, подождите...</div>}>
      <BookingContent />
    </Suspense>
  );
}