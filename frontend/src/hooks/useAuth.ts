'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useMutation, useQuery } from '@apollo/client';

const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

const SIGN_UP = gql`
  mutation SignUp($email: String!, $password: String!) {
    signUp(email: $email, password: $password) {
      token
      user {
        id
        email
        name
      }
    }
  }
`;

const ME = gql`
  query Me {
    me {
      id
      email
      name
    }
  }
`;

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          email: payload.email,
          name: payload.name
        });
        localStorage.setItem('token', token);
      } catch (e) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/signin');
  }, [router]);

  const { data: userData, loading: userLoading } = useQuery(ME, {
    skip: !user,
  });

  const [signIn] = useMutation(SIGN_IN);
  const [signUp] = useMutation(SIGN_UP);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await signIn({
        variables: { email, password },
      });

      const newToken = data.signIn.token;
      setUser(data.signIn.user);
      localStorage.setItem('token', newToken);
      
      return data.signIn.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const { data } = await signUp({
        variables: { email, password },
      });

      const newToken = data.signUp.token;
      setUser(data.signUp.user);
      localStorage.setItem('token', newToken);
      
      return data.signUp.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    logout,
    login,
    register,
  };
} 