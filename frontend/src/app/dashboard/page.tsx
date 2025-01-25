'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!user) return null;

  const role = user.user_metadata.role;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Logged in as: {user.email}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Role: {role}
        </p>
      </div>
    </div>
  );
}
