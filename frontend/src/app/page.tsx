'use client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const GET_SEATS = gql`
  query GetSeats($type: String!) {
    seats(type: $type) {
      id
      row
      number
      status
      type
      price
      category
    }
  }
`;

const BOOK_SEATS = gql`
  mutation BookSeats($seatIds: [String!]!, $type: String!) {
    bookSeats(seatIds: $seatIds, type: $type) {
      id
      row
      number
      status
      type
      price
      category
    }
  }
`;

type EventType = 'cinema' | 'airplane' | 'concert';

interface Seat {
  id: string;
  row: number;
  number: number;
  status: 'available' | 'booked';
  type: EventType;
  price: number;
  category: string;
}

interface SeatsData {
  seats: Seat[];
}

const eventLabels: Record<EventType, string> = {
  cinema: 'Кинотеатр',
  airplane: 'Самолет',
  concert: 'Концерт',
};

export default function Home() {
  const router = useRouter();
  const { logout, user, isAuthenticated, loading } = useAuth();
  const [eventType, setEventType] = useState<EventType>('cinema');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [loading, isAuthenticated, router]);

  const { loading: seatsLoading, error, data, refetch } = useQuery<SeatsData>(GET_SEATS, {
    variables: { type: eventType },
    skip: !isAuthenticated || loading,
    fetchPolicy: 'network-only', // Добавляем для получения свежих данных
  });

  const [bookSeats] = useMutation<{ bookSeats: Seat[] }>(BOOK_SEATS, {
    update(cache, { data: bookingData }) {
      if (!bookingData) return;
      const bookedSeat = bookingData.bookSeats[0];
      const queryData = cache.readQuery<SeatsData>({
        query: GET_SEATS,
        variables: { type: eventType },
      });

      if (!queryData) return;

      cache.writeQuery({
        query: GET_SEATS,
        variables: { type: eventType },
        data: {
          seats: queryData.seats.map((seat) =>
            seat.id === bookedSeat.id ? bookedSeat : seat
          ),
        },
      });
    },
  });

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status === 'booked') return;

    try {
      const seatId = `${eventType}-${seat.row}-${seat.number}`;
      console.log('Booking seat:', { seatId, type: eventType });
      await bookSeats({
        variables: {
          seatIds: [seatId],
          type: eventType,
        },
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      refetch(); // Обновляем данные после бронирования
    } catch (error: any) {
      console.error('Booking error:', error);
      if (error.message === 'Not authenticated') {
        router.push('/auth/signin');
      } else {
        alert(error.message || 'Ошибка при бронировании места');
      }
    }
  };

  if (loading || seatsLoading) return <p className="p-4">Загрузка...</p>;
  if (!isAuthenticated) return null;
  if (error) return <p className="p-4 text-red-500">Ошибка: {error.message}</p>;
  if (!data?.seats) return <p className="p-4">Нет мест</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-4 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen relative"
    >
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-3xl font-bold text-indigo-900"
        >
          Система бронирования
        </motion.h1>

        <div className="flex items-center gap-4">
          <span className="text-indigo-900">{user?.email}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {(['cinema', 'airplane', 'concert'] as EventType[]).map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-4 rounded-lg capitalize font-medium shadow-md
              ${eventType === type
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-indigo-600 hover:bg-indigo-50'
              }
            `}
            onClick={() => setEventType(type)}
          >
            {eventLabels[type]}
          </motion.button>
        ))}
      </div>

      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm text-indigo-900">
        <p>Тип события: {eventType}</p>
        <p>Количество мест: {data.seats.length}</p>
        <div className="mt-2 flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span>Стандарт</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>Эконом</span>
          </div>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-3 gap-6 mb-6">
        {data.seats.map((seat) => (
          <motion.button
            key={seat.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              group relative p-6 rounded-lg shadow-lg
              ${seat.status === 'booked'
                ? 'bg-rose-500 text-white cursor-not-allowed'
                : seat.category === 'vip'
                ? 'bg-green-500 text-white hover:bg-indigo-500 transition-colors'
                : seat.category === 'standard'
                ? 'bg-blue-500 text-white hover:bg-indigo-500 transition-colors'
                : 'bg-red-500 text-white hover:bg-indigo-500 transition-colors'
              }
            `}
            onClick={() => handleSeatClick(seat)}
            disabled={seat.status === 'booked'}
          >
            <div className="text-lg font-medium">Ряд {seat.row}</div>
            <div className="text-lg">Место {seat.number}</div>
            <div className="text-sm opacity-75">
              {seat.status === 'booked' ? 'Забронировано' : 'Свободно'}
            </div>
            <div className="text-sm mt-2">
              Цена: {seat.price}₽
            </div>
            <div className="text-sm">
              Категория: {seat.category}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-sm px-3 py-1 rounded whitespace-nowrap pointer-events-none"
            >
              {seat.status === 'booked'
                ? 'Это место уже забронировано'
                : 'Нажмите для бронирования (15 минут)'}
            </motion.div>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            <p>Место забронировано успешно!</p>
            <p className="text-sm opacity-90">Время бронирования 15 минут</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}