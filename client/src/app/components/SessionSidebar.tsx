'use client'

import { useState } from 'react'
import { useSession } from '../store/useSession'

export default function SessionSidebar() {
  const { 
    sessions, 
    currentSession, 
    isLoading, 
    createSession, 
    loadSession, 
    updateSessionName, 
    deleteSession 
  } = useSession()
  
  const [isCreating, setIsCreating] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return
    
    setIsCreating(true)
    await createSession(newSessionName.trim())
    setNewSessionName('')
    setIsCreating(false)
  }

  const handleEditSession = async (sessionId: string) => {
    if (!editName.trim()) return
    
    await updateSessionName(sessionId, editName.trim())
    setEditingSession(null)
    setEditName('')
  }

  const startEdit = (sessionId: string, currentName: string) => {
    setEditingSession(sessionId)
    setEditName(currentName)
  }

  const cancelEdit = () => {
    setEditingSession(null)
    setEditName('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Sessions</h2>
        
        {/* Create New Session */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="New session name..."
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleCreateSession}
            disabled={!newSessionName.trim() || isCreating}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isCreating ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">No sessions yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first session above</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group p-3 rounded-lg cursor-pointer transition duration-200 ${
                  currentSession?.id === session.id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => loadSession(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {editingSession === session.id ? (
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleEditSession(session.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditSession(session.id)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {session.name}
                          </h3>
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEdit(session.id, session.name)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit name"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this session?')) {
                                  deleteSession(session.id)
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Delete session"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                          <span>{session.messageCount} messages</span>
                          {session.hasComponent && (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                              Component
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(session.lastAccessed)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}