import { create } from 'zustand'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string
  timestamp: string
}

interface Component {
  jsx: string
  css: string
  timestamp: string
}

interface Session {
  id: string
  name: string
  messages: Message[]
  currentComponent: Component | null
  componentHistory: Component[]
  created: string
  lastAccessed: string
}

interface SessionListItem {
  id: string
  name: string
  lastAccessed: string
  created: string
  messageCount: number
  hasComponent: boolean
}

interface SessionState {
  sessions: SessionListItem[]
  currentSession: Session | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchSessions: () => Promise<void>
  createSession: (name?: string) => Promise<Session | null>
  loadSession: (sessionId: string) => Promise<void>
  updateSessionName: (sessionId: string, name: string) => Promise<void>
  deleteSession: (sessionId: string) => Promise<void>
  sendMessage: (content: string, image?: File, isRefinement?: boolean) => Promise<void>
  clearCurrentSession: () => void
  revertToComponent: (componentIndex: number) => Promise<void>
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const useSession = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ sessions: response.data, isLoading: false })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch sessions',
        isLoading: false 
      })
    }
  },

  createSession: async (name?: string) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${API_URL}/sessions`, 
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      const newSession = response.data
      set({ 
        currentSession: newSession,
        isLoading: false 
      })
      
      // Refresh session list
      get().fetchSessions()
      
      return newSession
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to create session',
        isLoading: false 
      })
      return null
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({ 
        currentSession: response.data,
        isLoading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to load session',
        isLoading: false 
      })
    }
  },

  updateSessionName: async (sessionId: string, name: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${API_URL}/sessions/${sessionId}`, 
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Update local state
      const state = get()
      if (state.currentSession?.id === sessionId) {
        set({
          currentSession: {
            ...state.currentSession,
            name
          }
        })
      }
      
      // Refresh session list
      get().fetchSessions()
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to update session name'
      })
    }
  },

  deleteSession: async (sessionId: string) => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Clear current session if it's the one being deleted
      const state = get()
      if (state.currentSession?.id === sessionId) {
        set({ currentSession: null })
      }
      
      // Refresh session list
      get().fetchSessions()
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete session'
      })
    }
  },

  sendMessage: async (content: string, image?: File, isRefinement = false) => {
    const state = get()
    if (!state.currentSession) return

    set({ isLoading: true, error: null })
    
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('content', content)
      formData.append('isRefinement', isRefinement.toString())
      
      if (image) {
        formData.append('image', image)
      }

      const response = await axios.post(
        `${API_URL}/sessions/${state.currentSession.id}/messages`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      // Update current session with new message and component
      const updatedSession = {
        ...state.currentSession,
        messages: [
          ...state.currentSession.messages,
          {
            role: 'user' as const,
            content,
            timestamp: new Date().toISOString(),
            ...(image && { image: URL.createObjectURL(image) })
          },
          response.data.message
        ],
        currentComponent: response.data.component
      }

      set({ 
        currentSession: updatedSession,
        isLoading: false 
      })

    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to send message',
        isLoading: false 
      })
    }
  },

  revertToComponent: async (componentIndex: number) => {
    const state = get()
    if (!state.currentSession) return

    set({ isLoading: true, error: null })
    
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/sessions/${state.currentSession.id}/revert/${componentIndex}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update current session with reverted component
      const updatedSession = {
        ...state.currentSession,
        currentComponent: response.data.component,
        messages: [
          ...state.currentSession.messages,
          {
            role: 'assistant' as const,
            content: response.data.message,
            timestamp: new Date().toISOString()
          }
        ]
      }

      set({ 
        currentSession: updatedSession,
        isLoading: false 
      })

    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to revert component',
        isLoading: false 
      })
    }
  },

  clearCurrentSession: () => {
    set({ currentSession: null, error: null })
  }
}))