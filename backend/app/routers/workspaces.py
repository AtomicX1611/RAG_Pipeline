"""
Workspaces router — CRUD for workspaces.

Endpoints:
  GET    /api/workspaces                — list all workspaces (auto-creates Default)
  POST   /api/workspaces                — create a new workspace
  PATCH  /api/workspaces/{id}           — rename / update description
  DELETE /api/workspaces/{id}           — delete a workspace and its documents
"""

from fastapi import APIRouter, Depends, HTTPException, status

from ..dependencies import get_current_user, get_workspace_service
from ..schemas.auth import UserProfile
from ..schemas.workspaces import WorkspaceCreate, WorkspacePatch, WorkspaceResponse
from ..services.workspace_service import WorkspaceService

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.get("", response_model=list[WorkspaceResponse])
async def list_workspaces(
    user: UserProfile = Depends(get_current_user),
    workspace_service: WorkspaceService = Depends(get_workspace_service),
):
    """List all workspaces for the current user (newest first)."""
    return await workspace_service.list_workspaces(user.id)


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    body: WorkspaceCreate,
    user: UserProfile = Depends(get_current_user),
    workspace_service: WorkspaceService = Depends(get_workspace_service),
):
    """Create a new workspace."""
    return await workspace_service.create_workspace(
        user.id, body.name, description=body.description, color=body.color
    )


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def rename_workspace(
    workspace_id: str,
    body: WorkspacePatch,
    user: UserProfile = Depends(get_current_user),
    workspace_service: WorkspaceService = Depends(get_workspace_service),
):
    """Rename a workspace and update its description."""
    return await workspace_service.rename_workspace(
        user.id, workspace_id, body.name, description=body.description
    )


@router.delete("/{workspace_id}")
async def delete_workspace(
    workspace_id: str,
    user: UserProfile = Depends(get_current_user),
    workspace_service: WorkspaceService = Depends(get_workspace_service),
):
    """Delete a workspace and its associated documents."""
    deleted = await workspace_service.delete_workspace(user.id, workspace_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return {"success": True, "message": "Workspace deleted successfully."}
