'use client';

import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">AutoCRM</h1>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn('test@example.com', 'password123')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
      )}
    </main>
  );
}
