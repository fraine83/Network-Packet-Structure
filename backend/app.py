from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.connection.reachability import check_reachability
from backend.connection.authentication import authenticate_ssh
from backend.connection.eve_ng import authenticate_eve_ng


app = FastAPI(
    title="Network Packet Structure API",
    version="0.1.0"
)


# Allow local frontend to communicate with the backend API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5502",
        "http://localhost:5502"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ============================================================
# REQUEST MODELS
# ============================================================

class ReachabilityRequest(BaseModel):
    environmentType: str
    host: str
    port: int = Field(default=22, ge=1, le=65535)


class AuthenticationRequest(BaseModel):
    environmentType: str
    host: str
    port: int = Field(default=22, ge=1, le=65535)
    username: str
    password: str


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }


# ============================================================
# REACHABILITY
# ============================================================

@app.post("/api/reachability")
def reachability_check(request: ReachabilityRequest):

    result = check_reachability(
        host=request.host,
        port=request.port
    )

    result["environment_type"] = request.environmentType

    return result


# ============================================================
# AUTHENTICATION
# ============================================================

@app.post("/api/authenticate")
def authentication_check(request: AuthenticationRequest):

    # EVE-NG uses its HTTP/API authentication.
    if request.environmentType == "eve_ng":

        result = authenticate_eve_ng(
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password
        )

    # Network devices and Linux hosts use SSH.
    elif request.environmentType in [
        "network_device",
        "linux"
    ]:

        result = authenticate_ssh(
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password
        )

    else:
        return {
            "authenticated": False,
            "environment_type": request.environmentType,
            "error": "Unsupported environment type"
        }

    result["environment_type"] = request.environmentType

    return result