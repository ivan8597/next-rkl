'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="container">
      <h1>Authentication Error</h1>
      <div className="error">
        {error === 'CredentialsSignin' 
          ? 'Invalid username or password'
          : 'An error occurred during authentication'}
      </div>
      <a href="/auth/signin">Try again</a>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 