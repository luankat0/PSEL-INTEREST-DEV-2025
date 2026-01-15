from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import get_session
from app.models import Team, TeamCreate, TeamUpdate, TeamRead, UserTeam, User, UserRead

router = APIRouter()

# --- CRUD Básico de Equipes ---

@router.post("/", response_model=TeamRead)
def create_team(*, session: Session = Depends(get_session), team: TeamCreate):
    # Regra: Líder deve ser um usuário existente
    leader = session.get(User, team.leader_id)
    if not leader:
        raise HTTPException(status_code=404, detail="Leader not found")
    
    # Regra: Líder único (Constraint de banco já pegaria, mas validamos antes para erro limpo)
    existing_team_led = session.exec(select(Team).where(Team.leader_id == team.leader_id)).first()
    if existing_team_led:
        raise HTTPException(status_code=400, detail="User is already leading another team")

    db_team = Team.model_validate(team)
    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    
    # Regra implícita: O líder também é membro da equipe? 
    # Depende da regra de negócio. Se sim, adicionaríamos em UserTeam aqui.
    return db_team

@router.get("/", response_model=List[TeamRead])
def read_teams(*, session: Session = Depends(get_session), offset: int = 0, limit: int = 100):
    teams = session.exec(select(Team).offset(offset).limit(limit)).all()
    return teams

@router.get("/{team_id}", response_model=TeamRead)
def read_team(*, session: Session = Depends(get_session), team_id: int):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

# --- Gestão de Membros (Adicionar/Remover) ---

@router.post("/{team_id}/members/{user_id}", response_model=Any)
def add_member_to_team(*, session: Session = Depends(get_session), team_id: int, user_id: int):
    """
    Adiciona um usuário a uma equipe.
    Se o usuário já estiver em outra equipe, move-o para a nova (ou lança erro, conforme decisão).
    Aqui, implementamos a lógica de 'Bloquear' se já estiver em outra, para segurança.
    """
    team = session.get(Team, team_id)
    user = session.get(User, user_id)
    if not team or not user:
        raise HTTPException(status_code=404, detail="Team or User not found")

    # Verifica se usuário já está em ALGUMA equipe
    existing_membership = session.exec(select(UserTeam).where(UserTeam.user_id == user_id)).first()
    
    if existing_membership:
        if existing_membership.team_id == team_id:
            return {"message": "User already in this team"}
        else:
            raise HTTPException(status_code=400, detail="User is already a member of another team. Remove first.")

    # Cria nova associação
    user_team = UserTeam(team_id=team_id, user_id=user_id)
    session.add(user_team)
    session.commit()
    return {"message": "User added to team successfully"}

@router.delete("/{team_id}/members/{user_id}")
def remove_member_from_team(*, session: Session = Depends(get_session), team_id: int, user_id: int):
    membership = session.exec(
        select(UserTeam).where(UserTeam.user_id == user_id, UserTeam.team_id == team_id)
    ).first()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Member not found in this team")
        
    session.delete(membership)
    session.commit()
    return {"message": "User removed from team"}

@router.get("/{team_id}/members", response_model=List[UserRead])
def read_team_member(*, session: Session = Depends(get_session), team_id: int):
    """
    Lista todos os membros da equipe específica.
    """

    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    members = session.exec(
        select(User).join(UserTeam).where(UserTeam.team_id == team_id)
    ).all()

    return members

@router.patch("/{team_id}", response_model=TeamRead)
def update_team(*, session: Session = Depends(get_session), team_id: int, team_update: TeamUpdate):
    db_team = session.get(Team, team_id)
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")

    if team_update.leader_id is not None:
        # 1. Verificar se o novo líder existe
        new_leader = session.get(User, team_update.leader_id)
        if not new_leader:
            raise HTTPException(status_code=404, detail="New leader not found")
        
        # 2. Verificar se o novo líder JÁ é líder de outra equipe (Regra de Líder Único)
        # Ignora se for a mesma equipe
        existing_leadership = session.exec(
            select(Team).where(Team.leader_id == team_update.leader_id, Team.id != team_id)
        ).first()
        
        if existing_leadership:
             raise HTTPException(status_code=400, detail="Este usuário já lidera outra equipe.")

    # Atualiza os dados
    team_data = team_update.model_dump(exclude_unset=True)
    db_team.sqlmodel_update(team_data)
    
    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    return db_team