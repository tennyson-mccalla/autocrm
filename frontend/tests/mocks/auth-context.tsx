import React from 'react';
import { AuthContext } from '../../src/contexts/AuthContext';

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { role: 'customer' }
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
