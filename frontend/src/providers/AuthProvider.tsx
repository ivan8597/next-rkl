'use client';

import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider refetchInterval={0}>
      {children}
    </SessionProvider>
  );
} 