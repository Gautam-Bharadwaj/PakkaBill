from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.post("/analyze/dealer")
def analyze_dealer():
    return {
        "segments": {"high_value": [], "at_risk": [], "dormant": []},
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "note": "Stub — KMeans on dealer features",
    }
