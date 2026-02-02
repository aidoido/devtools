import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import ToolView from './components/ToolView'
import { ToolType } from './types'

function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('json-formatter')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden relative">
      <Sidebar 
        activeTool={activeTool} 
        onToolChange={setActiveTool}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <ToolView tool={activeTool} />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#000',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#fff',
              secondary: '#000',
            },
          },
          error: {
            iconTheme: {
              primary: '#fff',
              secondary: '#000',
            },
          },
        }}
      />
    </div>
  )
}

export default App

