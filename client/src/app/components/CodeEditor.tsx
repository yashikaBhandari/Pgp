'use client'

import { useRef, useEffect } from 'react'
import { Editor } from '@monaco-editor/react'

interface CodeEditorProps {
  code: string
  language: 'typescript' | 'css'
  onChange?: (value: string) => void
  readOnly?: boolean
}

export default function CodeEditor({ code, language, onChange, readOnly = true }: CodeEditorProps) {
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure TypeScript/JavaScript
    if (language === 'typescript') {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        jsx: monaco.languages.typescript.JsxEmit.React,
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        allowJs: true,
        typeRoots: ['node_modules/@types']
      })

      // Add React types
      const reactTypes = `
        declare module 'react' {
          export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
          export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
          export function useRef<T>(initialValue: T): { current: T };
          export function useMemo<T>(factory: () => T, deps: any[]): T;
          export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
          export interface FC<P = {}> {
            (props: P): JSX.Element | null;
          }
          export interface ReactNode {}
          export interface CSSProperties {}
        }
        
        declare global {
          namespace JSX {
            interface Element {}
            interface IntrinsicElements {
              [elemName: string]: any;
            }
          }
        }
      `
      
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        reactTypes,
        'file:///node_modules/@types/react/index.d.ts'
      )
    }

    // Set editor theme
    monaco.editor.defineTheme('custom-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'd73a49' },
        { token: 'string', foreground: '032f62' },
        { token: 'number', foreground: '005cc5' },
        { token: 'operator', foreground: 'd73a49' },
      ],
      colors: {
        'editor.background': '#fafbfc',
        'editor.foreground': '#24292e',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editor.selectionBackground': '#c8e1ff',
        'editorCursor.foreground': '#24292e',
        'editorLineNumber.foreground': '#1b1f234d',
        'editorLineNumber.activeForeground': '#24292e',
      }
    })
    
    monaco.editor.setTheme('custom-theme')
  }

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        alert(`${language.toUpperCase()} code copied to clipboard!`)
      }).catch(() => {
        alert('Failed to copy code to clipboard')
      })
    }
  }

  if (!code && readOnly) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {language.toUpperCase()} Code</h3>
          <p className="text-gray-500">
            {language === 'css' 
              ? 'Generate a component to see custom CSS styles here.'
              : 'Generate a component to see the JSX/TSX code here.'
            }
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
          <h3 className="font-medium text-gray-900">
            {language === 'typescript' ? 'JSX/TSX Code' : 'CSS Styles'}
          </h3>
          {readOnly && (
            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
              Read Only
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition duration-200"
          >
            Copy Code
          </button>
          {!readOnly && onChange && (
            <button
              onClick={() => onChange?.(code)}
              className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition duration-200"
            >
              Apply Changes
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language === 'typescript' ? 'typescript' : 'css'}
          value={code}
          onChange={(value) => onChange?.(value || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            fontSize: 14,
            lineHeight: 20,
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            roundedSelection: false,
            cursorStyle: 'line',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            acceptSuggestionOnCommitCharacter: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            parameterHints: {
              enabled: true
            },
            hover: {
              enabled: true
            },
            contextmenu: true,
            mouseWheelZoom: true,
            links: true,
            colorDecorators: language === 'css',
            bracketPairColorization: {
              enabled: true
            }
          }}
        />
      </div>
    </div>
  )
}