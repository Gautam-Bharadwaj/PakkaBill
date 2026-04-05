from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.get("/detect/low-margin")
def low_margin():
    return {
        "threshold_margin_pct": 15.0,
        "products": [],
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "note": "Stub — statistical threshold on margins",
    }
