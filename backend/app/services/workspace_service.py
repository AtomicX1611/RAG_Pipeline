from ..repositories.workspace_repository import WorkspaceRepository
from ..repositories.vector_repository import VectorRepository
from ..schemas.workspaces import WorkspaceResponse
from ..utils.exceptions import NotFoundError
from ..utils.logging_config import get_logger

logger = get_logger(__name__)

_COLOR_PALETTE = ["violet", "blue", "emerald", "rose", "amber", "cyan", "pink", "indigo"]


class WorkspaceService:
    def __init__(self, ws_repo: WorkspaceRepository, vec_repo: VectorRepository):
        self._ws_repo = ws_repo
        self._vec_repo = vec_repo

    async def create_workspace(
        self, user_id: str, name: str, description: str = "", color: str = "violet"
    ) -> WorkspaceResponse:
        # Assign a colour automatically if the caller doesn't specify one
        if not color or color == "violet":
            existing = await self._ws_repo.get_all(user_id)
            auto_color = _COLOR_PALETTE[len(existing) % len(_COLOR_PALETTE)]
        else:
            auto_color = color

        ws = await self._ws_repo.create(user_id, name, description=description, color=auto_color)
        return self._to_response(user_id, ws)

    async def list_workspaces(self, user_id: str) -> list[WorkspaceResponse]:
        wss = await self._ws_repo.get_all(user_id)
        if not wss:
            # Auto-create a default workspace for new users
            ws = await self._ws_repo.create(user_id, "Default Workspace", color="violet")
            wss = [ws]

        wss.sort(key=lambda w: w.created_at)
        return [self._to_response(user_id, w) for w in wss]

    async def rename_workspace(
        self, user_id: str, ws_id: str, name: str, description: str = ""
    ) -> WorkspaceResponse:
        ws = await self._ws_repo.rename(user_id, ws_id, name, description)
        if ws is None:
            raise NotFoundError(f"Workspace {ws_id} not found")
        logger.info("Renamed workspace %s for user %s → '%s'", ws_id, user_id, name)
        return self._to_response(user_id, ws)

    async def delete_workspace(self, user_id: str, ws_id: str) -> bool:
        deleted = await self._ws_repo.delete(user_id, ws_id)
        if deleted:
            try:
                self._vec_repo.delete_collection(user_id, ws_id)
            except Exception:
                pass
        return deleted

    def _to_response(self, user_id: str, ws) -> WorkspaceResponse:
        count = self._vec_repo.collection_count(user_id, ws.id)
        return WorkspaceResponse(
            id=ws.id,
            name=ws.name,
            description=ws.description,
            color=ws.color,
            created_at=ws.created_at,
            document_count=count,
        )
