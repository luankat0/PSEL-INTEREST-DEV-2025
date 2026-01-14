import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Team, User } from '@/types';
import { toast } from 'sonner';

export default function TeamDetailPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadData = async () => {
    try {
        const teamRes = await api.get<Team>(`/teams/${id}`);
        setTeam(teamRes.data);
        const usersRes = await api.get<User[]>('/users/');
        setUsers(usersRes.data);
    } catch (error) {
        toast.error("Erro ao carregar equipe");
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await api.post(`/teams/${id}/members/${selectedUserId}`);
      toast.success("Membro adicionado!");
      setIsAddOpen(false);
    } catch (error: any) {
        // Exibe o erro de regra de negócio (usuário já em equipe)
        toast.error(error.response?.data?.detail || "Erro ao adicionar membro");
    }
  };

  if (!team) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Card de Topo */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
        <p className="text-slate-500 mt-2">{team.description || "Sem descrição"}</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">Membros da Equipe</h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Adicionar Membro
        </button>
      </div>

      <div className="bg-slate-50 rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
        <p>
            A lista de membros aparecerá aqui quando o endpoint <code className="bg-slate-200 px-1 rounded text-sm">GET /teams/{id}/members</code> for implementado no backend.
        </p>
        <p className="mt-2 text-sm text-blue-600">
            Teste a regra de unicidade clicando em "Adicionar Membro" acima.
        </p>
      </div>

      {/* Modal de Adicionar */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold mb-4">Adicionar à {team.name}</h2>
            <div className="space-y-4">
               <label className="block text-sm font-medium text-slate-700">Selecione o Usuário</label>
               <select 
                  className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  defaultValue=""
               >
                  <option value="" disabled>Escolha...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
                    <button onClick={handleAddMember} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirmar</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}