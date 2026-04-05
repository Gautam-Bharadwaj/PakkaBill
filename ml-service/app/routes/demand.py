from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class DemandRequest(BaseModel):
    horizon_days: int = Field(default=30, ge=1, le=90)


@router.post("/predict/demand")
def predict_demand(body: DemandRequest):
    return {
        "horizon_days": body.horizon_days,
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "top_products": [
            {"product_name": "Notebook A4 Ruled 1", "expected_units": 420, "confidence": 0.62},
        ],
        "note": "Stub — train Prophet/ARIMA on invoice history",
    }
