import asyncio
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from dataclasses import dataclass

@dataclass
class Workspace:
    id: str
    name: str
    created_at: str
    description: str = ""
    color: str = "violet"  # palette key used by the frontend

class WorkspaceRepository:
    """Per-user in-memory workspace store."""
    def __init__(self) -> None:
        # { user_id: { workspace_id: Workspace } }
        self._store: dict[str, dict[str, Workspace]] = defaultdict(dict)
        self._lock = asyncio.Lock()

    async def create(self, user_id: str, name: str, description: str = "", color: str = "violet") -> Workspace:
        async with self._lock:
            ws = Workspace(
                id=str(uuid.uuid4()),
                name=name,
                description=description,
                color=color,
                created_at=datetime.now(timezone.utc).isoformat(),
            )
            self._store[user_id][ws.id] = ws
            return ws

    async def get_all(self, user_id: str) -> list[Workspace]:
        async with self._lock:
            return list(self._store[user_id].values())

    async def get_by_id(self, user_id: str, ws_id: str) -> Workspace | None:
        async with self._lock:
            return self._store[user_id].get(ws_id)

    async def rename(self, user_id: str, ws_id: str, name: str, description: str = "") -> Workspace | None:
        async with self._lock:
            ws = self._store[user_id].get(ws_id)
            if ws is None:
                return None
            ws.name = name
            ws.description = description
            return ws

    async def delete(self, user_id: str, ws_id: str) -> bool:
        async with self._lock:
            return bool(self._store[user_id].pop(ws_id, None))
