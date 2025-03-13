'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignIn() {
  const router = useRouter();
  const { login, register, isAuthenticated, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('Attempting login/register...');
      if (isLogin) {
        await login(email, password);
        console.log('Login successful, redirecting...');
        router.push('/');
      } else {
        await register(email, password);
        console.log('Registration successful, redirecting...');
        router.push('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  if (loading) return <p className="p-4">Загрузка...</p>;
  if (isAuthenticated) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-indigo-900">{isLogin ? 'Вход' : 'Регистрация'}</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-10"
              required
            />
            <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center pr-3 mt-6 text-gray-500 hover:text-gray-700">
              {showPassword ? <FaEyeSlash data-testid="eye-slash" /> : <FaEye data-testid="eye" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm text-indigo-600 hover:text-indigo-500 w-full text-center">
          {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </button>
      </motion.div>
    </motion.div>
  );
}