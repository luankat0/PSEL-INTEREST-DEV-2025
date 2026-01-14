import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="border-b bg-white px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl font-bold text-blue-600 hover:text-blue-700">
          Interest Dev
        </Link>
      </div>

      <nav className="flex items-center gap-4">
        <Link 
          to="/users" 
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          Usuários
        </Link>
        <Link 
          to="/teams" 
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          Equipes
        </Link>
      </nav>
    </header>
  );
}