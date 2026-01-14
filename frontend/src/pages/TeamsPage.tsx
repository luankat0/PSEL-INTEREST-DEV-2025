import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Team, TeamCreate, User } from '@/types';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeam, setNewTeam] = useState<TeamCreate>({ name: '', description: '', leader_id: 0 });

  const fetchData = async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        api.get<Team[]>('/teams/'),
        api.get<User[]>('/users/')
      ]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newTeam.name || newTeam.leader_id === 0) {
        toast.warning('Preencha nome e líder');
        return;
    }
    try {
      await api.post('/teams/', newTeam);
      toast.success('Equipe criada!');
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao criar equipe');
    }
  };

  const getLeaderName = (id: number) => users.find(u => u.id === id)?.name || 'Desconhecido';

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Equipes</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Nova Equipe
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-semibold">Nome</th>
              <th className="px-6 py-3 font-semibold">Líder</th>
              <th className="px-6 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{team.name}</td>
                <td className="px-6 py-4 text-slate-600">{getLeaderName(team.leader_id)}</td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/teams/${team.id}`}>
                    <button className="text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1 rounded hover:bg-blue-50">
                        Detalhes
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold mb-4">Criar Equipe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Equipe</label>
                <input
                  className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Líder</label>
                <select 
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    onChange={(e) => setNewTeam({ ...newTeam, leader_id: Number(e.target.value) })}
                    defaultValue=""
                >
                    <option value="" disabled>Selecione um líder...</option>
                    {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}