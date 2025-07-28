// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../store/useAuth'
import { useSession } from '../store/useSession'
import Navbar from '../components/Navbar'
import SessionSidebar from '../components/SessionSidebar'
import ComponentGenerator from '../components/ComponentGenerator'

export default function DashboardPage() {
  const { isAuthenticated, initializeAuth } = useAuth()
  const { currentSession, fetchSessions } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Fetch user sessions on load
    fetchSessions().finally(() => setIsLoading(false))
  }, [isAuthenticated, router, initializeAuth, fetchSessions])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Session Sidebar */}
        <SessionSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <ComponentGenerator />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome to Component Generator
                </h2>
                <p className="text-gray-600 mb-6">
                  Create a new session or select an existing one to start generating React components with AI assistance.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    AI-powered component generation
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    Live preview and code editing
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    Export and download components
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
