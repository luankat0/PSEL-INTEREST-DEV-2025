import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Team, User } from '@/types';
import { toast } from 'sonner';

export default function TeamDetailPage() {
  const { id } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  
  const [users, setUsers] = useState<User[]>([]); 
  const [members, setMembers] = useState<User[]>([]); 
  
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<User | null>(null);

  const [isChangeLeaderOpen, setIsChangeLeaderOpen] = useState(false);
  const [newLeaderId, setNewLeaderId] = useState<string>("");

  const handleChangeLeader = async () => {
    if (!newLeaderId) return;
    try {
        await api.patch(`/teams/${id}`, { leader_id: Number(newLeaderId) });
        toast.success("Líder alterado com sucesso!");
        setIsChangeLeaderOpen(false);
        loadData(); // Recarrega para atualizar a interface
    } catch (error: any) {
        toast.error(error.response?.data?.detail || "Erro ao alterar líder");
    }
  };

  const loadData = async () => {
    try {
        const teamRes = await api.get<Team>(`/teams/${id}`);
        setTeam(teamRes.data);
        
        const usersRes = await api.get<User[]>('/users/');
        setUsers(usersRes.data);

        const membersRes = await api.get<User[]>(`/teams/${id}/members`);
        setMembers(membersRes.data);
    } catch (error) {
        toast.error("Erro ao carregar dados da equipe");
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await api.post(`/teams/${id}/members/${selectedUserId}`);
      toast.success("Membro adicionado!");
      setIsAddOpen(false);
      loadData(); 
    } catch (error: any) {
        toast.error(error.response?.data?.detail || "Erro ao adicionar membro");
    }
  };

  // 1. Abre o Modal de Confirmação
  const confirmRemove = (member: User) => {
      setMemberToRemove(member);
      setIsRemoveOpen(true);
  }

  // 2. Executa a remoção de fato
  const handleRemoveMember = async () => {
      if(!memberToRemove) return;
      try {
          await api.delete(`/teams/${id}/members/${memberToRemove.id}`);
          toast.success("Membro removido.");
          setIsRemoveOpen(false);     // Fecha modal
          setMemberToRemove(null);    // Limpa seleção
          loadData();                 // Atualiza lista
      } catch (error) {
          toast.error("Erro ao remover membro.");
      }
  }

  if (!team) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Card de Topo */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
        <p className="text-slate-500 mt-2">{team.description || "Sem descrição"}</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
            Líder ID: {team.leader_id}
          </div>
          <button 
            onClick={() => setIsChangeLeaderOpen(true)}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Alterar Líder
          </button>
        </div>
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

      {/* Tabela de Membros */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-6 py-3 font-semibold">ID</th>
              <th className="px-6 py-3 font-semibold">Nome</th>
              <th className="px-6 py-3 font-semibold">Email</th>
              <th className="px-6 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {members.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Nenhum membro (além do líder) nesta equipe.
                    </td>
                </tr>
            ) : (
                members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{member.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-6 py-4 text-slate-600">{member.email}</td>
                    <td className="px-6 py-4 text-right">
                        {member.id !== team.leader_id && (
                            <button 
                                // Chama a função que abre o modal
                                onClick={() => confirmRemove(member)}
                                className="text-red-600 hover:text-red-800 font-medium px-3 py-1 hover:bg-red-50 rounded"
                            >
                                Remover
                            </button>
                        )}
                        {member.id === team.leader_id && (
                            <span className="text-xs font-bold text-blue-600 uppercase border border-blue-200 px-2 py-1 rounded">Líder</span>
                        )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
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
                    <option key={u.id} value={u.id} disabled={members.some(m => m.id === u.id)}>
                        {u.name} {members.some(m => m.id === u.id) ? '(Já na equipe)' : ''}
                    </option>
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

      {/* Modal de Remover */}
      {isRemoveOpen && memberToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-2 text-red-600">Remover Membro</h2>
            
            <p className="text-slate-600 mb-6">
                Tem certeza que deseja remover <b>{memberToRemove.name}</b> da equipe <b>{team.name}</b>?
                <br/>
                <span className="text-sm text-slate-400">Esta ação irá desalocar o usuário imediatamente.</span>
            </p>

            <div className="flex justify-end gap-2">
                <button 
                    onClick={() => setIsRemoveOpen(false)} 
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded font-medium"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleRemoveMember} 
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium shadow-sm"
                >
                    Sim, Remover
                </button>
            </div>
          </div>
        </div>
      )}

      {isChangeLeaderOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 m-4">
        <h2 className="text-xl font-bold mb-4">Alterar Líder da Equipe</h2>
        <p className="text-sm text-slate-600 mb-4">
          Selecione um novo líder. O líder anterior se tornará um membro comum.
        </p>
      <div className="space-y-4">
        <select 
          className="w-full border border-slate-300 rounded px-3 py-2 bg-white"
          onChange={(e) => setNewLeaderId(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Selecione novo líder...</option>
          {users.map(u => (
            // Desabilita o líder atual
            <option key={u.id} value={u.id} disabled={u.id === team.leader_id}>
              {u.name} {u.id === team.leader_id ? '(Atual)' : ''}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setIsChangeLeaderOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancelar</button>
            <button onClick={handleChangeLeader} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
  )}
  </div>  
  );
}