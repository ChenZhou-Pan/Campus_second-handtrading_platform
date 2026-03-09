import { BrowserRouter } from 'react-router-dom'
import { App as AntApp } from 'antd'
import { AppRouter } from './router'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AntApp>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </AntApp>
    </BrowserRouter>
  )
}

export default App
