import os, sys, traceback

output = []
try:
    from app.config import get_settings
    output.append("config OK")
except Exception as e:
    output.append(f"config FAIL: {e}")

try:
    from app.schemas.auth import AuthResponse
    output.append("schemas OK")
except Exception as e:
    output.append(f"schemas FAIL: {e}")

try:
    from app.utils.exceptions import AppError
    output.append("exceptions OK")
except Exception as e:
    output.append(f"exceptions FAIL: {e}")

try:
    from app.repositories.vector_repository import VectorRepository
    output.append("vector_repo OK")
except Exception as e:
    output.append(f"vector_repo FAIL: {e}")

try:
    from app.services.auth_service import AuthService
    output.append("auth_service OK")
except Exception as e:
    output.append(f"auth_service FAIL: {e}")

try:
    from app.routers.auth import router
    output.append("auth_router OK")
except Exception as e:
    output.append(f"auth_router FAIL: {e}")

try:
    from app.main import app
    output.append("main OK")
except Exception as e:
    output.append(f"main FAIL: {e}")
    tb = traceback.format_exc()
    output.append(tb)

with open("test_output.txt", "w") as f:
    f.write("\n".join(output))
