from pydantic import BaseModel, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    color: str = Field(default="violet", max_length=30)


class WorkspacePatch(BaseModel):
    """Body for PATCH /api/workspaces/{id}  (rename / update description)."""
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: str = ""
    color: str = "violet"
    created_at: str
    document_count: int = 0
