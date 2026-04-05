# ML service — training with real data

The FastAPI service under `ml-service/` ships **stub** responses. To train on your MongoDB business data:

## Data access

1. Prefer a **read-only MongoDB user** or **read replica** URI in `ml-service/.env` (`MONGODB_URI`).
2. Aggregate from collections:
   - **Demand**: `invoices` — sum `items.quantity` by `productId` and `createdAt` week/month.
   - **Dealer clustering**: `dealers` — features: `pendingAmount`, `totalPurchased`, recency of last invoice.
   - **Pricing / low margin**: `products` — `sellingPrice`, `manufacturingCost`, realized margins from invoice line snapshots.

## Demand (Prophet or ARIMA)

1. Export a time series CSV: `ds` (date), `y` (units sold) per SKU.
2. Train Prophet per top SKU or globally; save models under `ml-service/models/`.
3. Load models in `predict/demand` and replace stub JSON with forecasts.

## Dealer clustering (KMeans)

1. Build a feature matrix (pandas) from dealer + invoice aggregates.
2. Fit `sklearn.cluster.KMeans` with `n_clusters=3`; map clusters to labels (high-value / at-risk / dormant) using business rules on centroids.
3. Persist `joblib` models and load at startup.

## Pricing regression

1. Use historical `unitPrice` vs `lineProfit` or margin from `invoices.items`.
2. Fit a regression with constraints (min/max price); output suggested prices for SKUs below target margin.

## Retraining cadence

- Weekly cron (or GitHub Action) that pulls new data, retrains, validates error metrics, and promotes new model files.
- Keep the API contract (JSON shape) stable so the Node proxy and mobile app do not break.
