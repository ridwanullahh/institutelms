import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import UniversalSDK, { User } from '../lib/sdk';
import { platformSchemas } from '../lib/schemas';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, profile: Partial<User>) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

// Initialize SDK with your GitHub repository details
const sdk = new UniversalSDK({
  owner: 'your-github-username', // Replace with your GitHub username
  repo: 'ai-institution-db', // Replace with your repository name
  token: 'your-github-token', // Replace with your GitHub personal access token
  schemas: platformSchemas
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Demo login - replace with actual authentication
          if (email === 'student@demo.com' && password === 'password123') {
            const demoUser: User = {
              id: '1',
              uid: 'demo-student-1',
              email: 'student@demo.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'student',
              preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                notifications: {
                  email: true,
                  push: true,
                  sms: false
                }
              },
              status: 'active',
              verified: true,
              academicInfo: {
                studentId: 'STU001',
                program: 'Computer Science',
                year: 3,
                gpa: 3.8,
                credits: 90,
                department: 'Engineering'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            set({
              user: demoUser,
              token: 'demo-token-student',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          }
          
          if (email === 'instructor@demo.com' && password === 'password123') {
            const demoUser: User = {
              id: '2',
              uid: 'demo-instructor-1',
              email: 'instructor@demo.com',
              firstName: 'Jane',
              lastName: 'Smith',
              role: 'instructor',
              preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                notifications: {
                  email: true,
                  push: true,
                  sms: false
                }
              },
              status: 'active',
              verified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            set({
              user: demoUser,
              token: 'demo-token-instructor',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          }
          
          if (email === 'admin@demo.com' && password === 'password123') {
            const demoUser: User = {
              id: '3',
              uid: 'demo-admin-1',
              email: 'admin@demo.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
              preferences: {
                theme: 'light',
                language: 'en',
                timezone: 'UTC',
                notifications: {
                  email: true,
                  push: true,
                  sms: false
                }
              },
              status: 'active',
              verified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            set({
              user: demoUser,
              token: 'demo-token-admin',
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return;
          }

          // Try SDK login for production
          const result = await sdk.login(email, password);
          
          if (typeof result === 'object' && 'otpRequired' in result) {
            set({ isLoading: false, error: 'OTP verification required' });
            return;
          }
          
          const token = result as string;
          const user = sdk.getCurrentUser(token);
          
          if (user) {
            // Update last login
            await sdk.update('users', user.id!, { lastLogin: new Date().toISOString() });
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            throw new Error('Failed to retrieve user information');
          }
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false,
            isAuthenticated: false
          });
          throw error;
        }
      },

      register: async (email: string, password: string, profile: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const user = await sdk.register(email, password, {
            ...profile,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          
          const token = await sdk.login(email, password) as string;
          
          set({
            user: sdk.getCurrentUser(token),
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        const { token } = get();
        if (token && token.startsWith('demo-token')) {
          // Demo logout
        } else if (token) {
          sdk.destroySession(token);
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      clearError: () => set({ error: null }),

      updateProfile: async (updates: Partial<User>) => {
        const { user, token } = get();
        if (!user || !token) throw new Error('Not authenticated');
        
        set({ isLoading: true });
        try {
          if (token.startsWith('demo-token')) {
            // Demo update
            set({
              user: { ...user, ...updates, updatedAt: new Date().toISOString() },
              isLoading: false
            });
          } else {
            const updatedUser = await sdk.update('users', user.id!, {
              ...updates,
              updatedAt: new Date().toISOString()
            });
            
            set({
              user: updatedUser,
              isLoading: false
            });
          }
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false
          });
          throw error;
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { user, token } = get();
        if (!user) throw new Error('Not authenticated');
        
        set({ isLoading: true });
        try {
          if (token?.startsWith('demo-token')) {
            // Demo password change
            set({ isLoading: false });
            return;
          }
          
          // Verify current password
          await sdk.login(user.email, currentPassword);
          
          // Update password
          const hashedPassword = sdk.hashPassword(newPassword);
          await sdk.update('users', user.id!, { 
            password: hashedPassword,
            updatedAt: new Date().toISOString()
          });
          
          set({ isLoading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false
          });
          throw error;
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await sdk.requestPasswordReset(email);
          set({ isLoading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false
          });
          throw error;
        }
      },

      resetPassword: async (email: string, otp: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await sdk.resetPassword(email, otp, newPassword);
          set({ isLoading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            isLoading: false
          });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export { sdk };