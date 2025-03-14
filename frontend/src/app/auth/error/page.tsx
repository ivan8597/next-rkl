'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="container">
      <h1>Ошибка аутентификации</h1>
      <div className="error">
        {error === 'CredentialsSignin' 
          ? 'Неверное имя пользователя или пароль'
          : 'Ошибка при аутентификации'}
      </div>
      <a href="/auth/signin">Попробовать снова</a>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Пожалуйста, подождите...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 