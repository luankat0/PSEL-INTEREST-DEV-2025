from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

# --- Tabela de Associação (Users <-> Teams) ---
class UserTeam(SQLModel, table=True):
    __tablename__ = "users_teams"

    id: Optional[int] = Field(default=None, primary_key=True)
    team_id: int = Field(foreign_key="team.id")
    # Constraint: unique=True garante que o usuário esteja em apenas UMA equipe
    user_id: int = Field(foreign_key="user.id", unique=True) 

# --- Modelo de Usuário ---
class UserBase(SQLModel):
    name: str
    email: str = Field(unique=True, index=True)
    is_active: bool = True

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relacionamentos (Lado inverso)
    team_membership: Optional["UserTeam"] = Relationship(back_populates=None)
    led_team: Optional["Team"] = Relationship(back_populates="leader")

class UserCreate(UserBase):
    pass

class UserRead(UserBase):
    id: int

# --- Modelo de Equipe ---
class TeamBase(SQLModel):
    name: str
    description: Optional[str] = None

class Team(TeamBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Constraint: unique=True garante que um líder só lidere UMA equipe
    leader_id: int = Field(foreign_key="user.id", unique=True)

    leader: "User" = Relationship(back_populates="led_team")
    # Propriedade para acessar membros via tabela de associação (opcional, para conveniência)
    # members: List["User"] = Relationship(link_model=UserTeam)

class TeamCreate(TeamBase):
    leader_id: int

class TeamRead(TeamBase):
    id: int
    leader_id: int

class TeamUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    leader_id: Optional[int] = None