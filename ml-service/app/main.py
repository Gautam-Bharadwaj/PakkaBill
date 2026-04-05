from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import demand, dealer, pricing, margin

app = FastAPI(title="Billo ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demand.router, tags=["demand"])
app.include_router(dealer.router, tags=["dealer"])
app.include_router(pricing.router, tags=["pricing"])
app.include_router(margin.router, tags=["margin"])


@app.get("/health")
def health():
    return {"ok": True}
