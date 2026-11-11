import './App.css'
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Home from './Home'
import Avaliacoes from './Avaliacoes'
import LoginButton from './LoginButton'

function App() {
  const [currentPage, setCurrentPage] = useState('avaliacoes')
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div className="center">Carregando...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="center">
        <div className="card login">
          <h1>Sistema de Tarefas</h1>
          <p className="muted">Entre para ver e gerenciar as tarefas.</p>
          <LoginButton />
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <nav className="card nav">
        <button
          className={currentPage === 'avaliacoes' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setCurrentPage('avaliacoes')}
        >
          Tarefas
        </button>
        <button
          className={currentPage === 'home' ? 'btn' : 'btn btn-secondary'}
          onClick={() => setCurrentPage('home')}
        >
          Meu perfil
        </button>
      </nav>
      {currentPage === 'home' && <Home />}
      {currentPage === 'avaliacoes' && <Avaliacoes />}
    </div>
  )
}

export default App
