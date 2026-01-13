from fastapi import APIRouter

from app.api.routes import utils, users, teams

api_router = APIRouter()
api_router.include_router(utils.router)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])