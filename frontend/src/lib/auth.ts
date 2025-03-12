import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

export const authOptions: NextAuthOptions = {
  secret: 's/zZoHuT7mvhUdIWgNrePJRMueETNne4W4PuQSC/GtE=', // Добавлено вручную
  debug: true,
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Authorize called with:', credentials);
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing username or password');
        }
        if (credentials.username === "user" && credentials.password === "password") {
          return {
            id: "1",
            name: "Test User",
            email: "user@example.com",
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
};