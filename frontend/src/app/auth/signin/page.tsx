'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignIn() {
  const router = useRouter();
  const { login, register, isAuthenticated, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.push('/');
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (isAuthenticated) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-900">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 w-full text-center"
        >
          {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </button>
      </motion.div>
    </motion.div>
  );
} 