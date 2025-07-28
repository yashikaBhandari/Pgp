// src/app/useAuth
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  initializeAuth: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      setAuth: (token: string, user: User) => {
        set({ 
          token, 
          user, 
          isAuthenticated: true 
        })
        // Also store in localStorage for API calls
        localStorage.setItem('token', token)
      },
      
      logout: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        })
        localStorage.removeItem('token')
      },
      
      initializeAuth: () => {
        const token = localStorage.getItem('token')
        const state = get()
        if (token && !state.isAuthenticated) {
          // Token exists but state is not authenticated
          // This means the page was refreshed
          set({ 
            token,
            isAuthenticated: true 
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

