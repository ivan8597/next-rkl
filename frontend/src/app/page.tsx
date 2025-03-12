'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
export default function Home() {
  const router = useRouter();

  const handleSelect = (type: string) => {
    router.push(`/booking?type=${type}`);
  };

  return (
    <main className="container">
      <h1>Book Your Seats</h1>
      <div>
        <button onClick={() => handleSelect('cinema')}>Cinema</button>
        <button onClick={() => handleSelect('airplane')}>Airplane</button>
        <button onClick={() => handleSelect('concert')}>Concert</button>
      </div>
    </main>
  );
}