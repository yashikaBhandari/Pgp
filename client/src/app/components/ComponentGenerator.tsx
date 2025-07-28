'use client'

import { useState } from 'react'
import { useSession } from '../store/useSession'
import ChatPanel from './ChatPanel'
import PreviewPanel from './PreviewPanel'
import CodeEditor from './CodeEditor'

export default function ComponentGenerator() {
  const { currentSession } = useSession()
  const [activeTab, setActiveTab] = useState<'preview' | 'jsx' | 'css'>('preview')

  if (!currentSession) return null

  return (
    <div className="flex-1 flex">
      {/* Chat Panel - Left */}
      <div className="w-96 border-r border-gray-200">
        <ChatPanel />
      </div>

      {/* Main Content Area - Right */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-white">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                activeTab === 'preview'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('jsx')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                activeTab === 'jsx'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              JSX/TSX
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                activeTab === 'css'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              CSS
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-50">
          {activeTab === 'preview' && <PreviewPanel />}
          {activeTab === 'jsx' && (
            <CodeEditor 
              code={currentSession.currentComponent?.jsx || ''} 
              language="typescript" 
            />
          )}
          {activeTab === 'css' && (
            <CodeEditor 
              code={currentSession.currentComponent?.css || ''} 
              language="css" 
            />
          )}
        </div>
      </div>
    </div>
  )
}