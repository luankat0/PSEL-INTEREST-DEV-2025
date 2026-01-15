from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import get_session
from app.models import Team, TeamCreate, TeamUpdate, TeamRead, UserTeam, User, UserRead

router = APIRouter()

def check_user_role_conflict(session: Session, user_id: int, new_role: str):
    """
    new_role: 'leader' ou 'member'
    Verifica se o usuário já ocupa a OUTRA função em qualquer lugar.
    """
    if new_role == 'leader':
        is_member = session.exec(select(UserTeam).where(UserTeam.user_id == user_id)).first()
        if is_member:
            raise HTTPException(status_code=400, detail="Este usuário já é membro de uma equipe. Remova-o da equipe antes de torná-lo líder.")
            
    # Se quer ser Membro, não pode ser Líder de nada
    if new_role == 'member':
        is_leader = session.exec(select(Team).where(Team.leader_id == user_id)).first()
        if is_leader:
            raise HTTPException(status_code=400, detail="Este usuário é um líder de equipe. Líderes não podem ser membros de outras equipes.")

# --- CRUD Básico de Equipes ---

@router.post("/", response_model=TeamRead)
def create_team(*, session: Session = Depends(get_session), team: TeamCreate):
    # 1. Valida se o líder existe
    leader = session.get(User, team.leader_id)
    if not leader:
        raise HTTPException(status_code=404, detail="Leader not found")
    
    # 2. Valida conflito de papéis (NOVO)
    # Verifica se ele já lidera (Constraint pega, mas validamos msg) ou se é membro
    existing_team_led = session.exec(select(Team).where(Team.leader_id == team.leader_id)).first()
    if existing_team_led:
        raise HTTPException(status_code=400, detail="Este usuário já lidera outra equipe.")
        
    check_user_role_conflict(session, team.leader_id, 'leader') # Verifica se ele é membro em algum lugar

    db_team = Team.model_validate(team)
    session.add(db_team)
    session.commit()
    session.refresh(db_team)
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
    team = session.get(Team, team_id)
    user = session.get(User, user_id)
    if not team or not user:
        raise HTTPException(status_code=404, detail="Team or User not found")
    
    # Se tentar adicionar o PRÓPRIO líder como membro, bloqueia (ou permite, dependendo da regra. A regra atual diz 'Nenhum usuário pode ser membro E líder')
    # Assumindo separação estrita:
    if team.leader_id == user_id:
         raise HTTPException(status_code=400, detail="O líder da equipe não pode ser adicionado como membro comum.")

    # Verifica se já é líder de alguma coisa (NOVO)
    check_user_role_conflict(session, user_id, 'member')

    # Verifica se já é membro (existente)
    existing_membership = session.exec(select(UserTeam).where(UserTeam.user_id == user_id)).first()
    if existing_membership:
        if existing_membership.team_id == team_id:
            return {"message": "User already in this team"}
        else:
            raise HTTPException(status_code=400, detail="User is already a member of another team.")

    user_team = UserTeam(team_id=team_id, user_id=user_id)
    session.add(user_team)
    session.commit()
    return {"message": "User added successfully"}

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
        new_leader = session.get(User, team_update.leader_id)
        if not new_leader:
            raise HTTPException(status_code=404, detail="New leader not found")
        
        # Se for o mesmo líder, ignora
        if team_update.leader_id != db_team.leader_id:
            # Verifica se já lidera OUTRA equipe
            existing_leadership = session.exec(
                select(Team).where(Team.leader_id == team_update.leader_id)
            ).first()
            if existing_leadership:
                 raise HTTPException(status_code=400, detail="Este usuário já lidera outra equipe.")
            
            # Verifica se é membro em algum lugar
            check_user_role_conflict(session, team_update.leader_id, 'leader')

    team_data = team_update.model_dump(exclude_unset=True)
    db_team.sqlmodel_update(team_data)
    session.add(db_team)
    session.commit()
    session.refresh(db_team)
    return db_team

@router.delete("/{team_id}")
def delete_team(*, session: Session = Depends(get_session), team_id: int):
    team = session.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # 1. Remove todos os membros da equipe primeiro
    memberships = session.exec(select(UserTeam).where(UserTeam.team_id == team_id)).all()
    for membership in memberships:
        session.delete(membership)
        
    # 2. Remove a equipe
    session.delete(team)
    session.commit()
    return {"message": "Team deleted successfully"}