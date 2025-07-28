'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from '../store/useSession'
import download from 'js-file-download'
import JSZip from 'jszip'

export default function PreviewPanel() {
  const { currentSession } = useSession()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (currentSession?.currentComponent?.jsx) {
      renderComponent()
    }
  }, [currentSession?.currentComponent])

  const renderComponent = () => {
    if (!iframeRef.current || !currentSession?.currentComponent?.jsx) return

    const { jsx, css } = currentSession.currentComponent
    
    // Create the HTML content for the iframe
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f9fafb;
      min-height: 100vh;
    }
    .preview-container {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      min-height: calc(100vh - 88px);
    }
    .error-container {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      color: #dc2626;
    }
    ${css || ''}
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    
    try {
      // Transform the component code
      ${jsx}
      
      // Render the component
      const container = document.getElementById('root');
      const root = ReactDOM.createRoot(container);
      
      function PreviewWrapper() {
        try {
          return (
            <div className="preview-container">
              <GeneratedComponent />
            </div>
          );
        } catch (error) {
          return (
            <div className="error-container">
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                Render Error
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                There was an error rendering this component:
              </p>
              <pre style={{ fontSize: '12px', overflow: 'auto', background: '#fff', padding: '8px', borderRadius: '4px' }}>
                {error.toString()}
              </pre>
            </div>
          );
        }
      }
      
      root.render(<PreviewWrapper />);
      
    } catch (error) {
      console.error('Component Error:', error);
      const container = document.getElementById('root');
      container.innerHTML = \`
        <div class="error-container">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
            Compilation Error
          </h3>
          <p style="margin: 0 0 8px 0; font-size: 14px;">
            There was an error compiling this component:
          </p>
          <pre style="font-size: 12px; overflow: auto; background: #fff; padding: 8px; border-radius: 4px; white-space: pre-wrap;">
            \${error.toString()}
          </pre>
        </div>
      \`;
    }
  </script>
</body>
</html>
    `

    // Set the iframe content
    const iframe = iframeRef.current
    iframe.srcdoc = htmlContent
  }

  const copyCode = (type: 'jsx' | 'css') => {
    if (!currentSession?.currentComponent) return

    const code = currentSession.currentComponent[type]
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        // Could add a toast notification here
        alert(`${type.toUpperCase()} code copied to clipboard!`)
      }).catch(() => {
        alert('Failed to copy code to clipboard')
      })
    }
  }

  const downloadZip = async () => {
    if (!currentSession?.currentComponent?.jsx) return

    setIsExporting(true)
    try {
      const zip = new JSZip()
      const { jsx, css } = currentSession.currentComponent

      // Create component file
      const componentName = 'GeneratedComponent'
      zip.file(`${componentName}.tsx`, jsx)

      // Create CSS file if there's custom CSS
      if (css && css.trim()) {
        zip.file(`${componentName}.css`, css)
      }

      // Create package.json
      const packageJson = {
        name: 'generated-component',
        version: '1.0.0',
        dependencies: {
          react: '^18.0.0',
          'react-dom': '^18.0.0',
          '@types/react': '^18.0.0',
          '@types/react-dom': '^18.0.0'
        },
        devDependencies: {
          typescript: '^5.0.0'
        }
      }
      zip.file('package.json', JSON.stringify(packageJson, null, 2))

      // Create README
      const readme = `# Generated Component

This component was generated using the AI Component Generator.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`tsx
import ${componentName} from './${componentName}'

function App() {
  return <${componentName} />
}
\`\`\`

## Files

- \`${componentName}.tsx\` - The main component
${css && css.trim() ? `- \`${componentName}.css\` - Custom styles` : ''}
- \`package.json\` - Dependencies
`
      zip.file('README.md', readme)

      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' })
      download(content, `${currentSession.name || 'component'}.zip`)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export component')
    } finally {
      setIsExporting(false)
    }
  }

  if (!currentSession?.currentComponent?.jsx) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Component Generated</h3>
          <p className="text-gray-500">
            Send a message in the chat to generate your first React component.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">Live Preview</h3>
          <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
            Component Ready
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => copyCode('jsx')}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition duration-200"
          >
            Copy JSX
          </button>
          <button
            onClick={() => copyCode('css')}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition duration-200"
          >
            Copy CSS
          </button>
          <button
            onClick={downloadZip}
            disabled={isExporting}
            className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition duration-200 disabled:opacity-50"
          >
            {isExporting ? 'Exporting...' : 'Download ZIP'}
          </button>
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 bg-gray-100">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Component Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  )
}