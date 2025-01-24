import React, { useContext } from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';
import { User } from '@supabase/supabase-js';

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { role: 'customer' },
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString(),
  };

  const mockAuthContext = {
    user: mockUser,
    signIn: jest.fn().mockResolvedValue({ user: mockUser, error: null }),
    signUp: jest.fn().mockResolvedValue({ user: mockUser, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    loading: false,
    error: null,
    updateProfile: jest.fn().mockResolvedValue({ user: mockUser, error: null }),
    updateRole: jest.fn().mockResolvedValue({ user: { ...mockUser, user_metadata: { role: 'admin' } }, error: null }),
    isAdmin: () => mockUser.user_metadata.role === 'admin',
    isWorker: () => mockUser.user_metadata.role === 'worker',
    isCustomer: () => mockUser.user_metadata.role === 'customer'
  };

  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
