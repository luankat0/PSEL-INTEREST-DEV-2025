from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api.deps import get_session
from app.models import User, UserCreate, UserRead, UserUpdate

router = APIRouter()

@router.post("/", response_model=UserRead)
def create_user(*, session: Session = Depends(get_session), user: UserCreate):
    db_user = User.model_validate(user)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.get("/", response_model=List[UserRead])
def read_users(*, session: Session = Depends(get_session), offset: int = 0, limit: int = 100):
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users

@router.patch("/{user_id}", response_model=UserRead)
def update_user(*, session: Session = Depends(get_session), user_id: int, user_update: UserUpdate):
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_update.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_data)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(*, session: Session = Depends(get_session), user_id: int):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validação: Não pode deletar se for Líder de alguma equipe
    leading_team = session.exec(select(Team).where(Team.leader_id == user_id)).first()
    if leading_team:
        raise HTTPException(
            status_code=400, 
            detail=f"Não é possível remover este usuário pois ele lidera a equipe '{leading_team.name}'. Substitua o líder ou apague a equipe primeiro."
        )

    # Remove associações como membro (UserTeam)
    memberships = session.exec(select(UserTeam).where(UserTeam.user_id == user_id)).all()
    for membership in memberships:
        session.delete(membership)

    session.delete(user)
    session.commit()
    return {"message": "User deleted successfully"}
