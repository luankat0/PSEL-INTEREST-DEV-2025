import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Componentes
import Header from './components/Header';

// Páginas
import UsersPage from './pages/UsersPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';

// Importar CSS global (garante que o Tailwind funcione)
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Menu Superior (Fixo em todas as rotas) */}
        <Header />

        <main>
          <Routes>
            {/* Rota Inicial / Home */}
            <Route 
              path="/" 
              element={
                <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                  <h1 className="text-4xl font-bold text-slate-800 mb-4">Bem-vindo ao Interest Dev</h1>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    Utilize o menu superior para gerenciar <b>Usuários</b> e <b>Equipes</b>.
                  </p>
                </div>
              } 
            />

            {/* Rotas de Usuários */}
            <Route path="/users" element={<UsersPage />} />

            {/* Rotas de Equipes */}
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
          </Routes>
        </main>

        {/* Componente de Notificações (Toasts) */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;