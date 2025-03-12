import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Упрощаем обработку, используя встроенный обработчик NextAuth
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };