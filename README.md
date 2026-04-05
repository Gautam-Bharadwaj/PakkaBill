# NoteTrack Pro — Wholesale Notebook Business Management System

**SESD final project** — full-stack app for dealer management, billing, PDF/UPI QR, WhatsApp queue, ML insights, and React Native (Android-first) client.

## Repository layout

| Path | Description |
|------|-------------|
| `idea.md` | Problem, solution, scope, features |
| `useCaseDiagram.md` | Mermaid use case diagram |
| `sequenceDiagram.md` | Mermaid sequence (invoice end-to-end) |
| `classDiagram.md` | Layers, services, repositories, design patterns |
| `ErDiagram.md` | MongoDB collections & relationships |
| `backend/` | Node.js + Express — **Controller → Service → Repository** |
| `mobile/` | React Native + Paper + Navigation |
| `ml-service/` | Python FastAPI (stub ML endpoints) |
| `postman/` | Postman collection |
| `docs/` | API notes, Android build, GitHub Releases, ML training |

## Architecture (backend)

```
HTTP → Routes → Controllers → Services → Repositories → MongoDB
                              ↘ PDF / QR / WhatsApp (jobs) / ML HTTP
```

**OOP & patterns:** `BaseRepository` + concrete repositories; **Strategy** (`discount.strategy.js`); **Factory** (`Invoice.factory.js`); **Observer** (`Notification.service.js` + `WhatsApp.service.js`); **Singleton** (DB config, `NotificationService` instance).

## Tech stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Android), React Native Paper |
| API | Node.js, Express, JWT (access + refresh; refresh also in httpOnly cookie) |
| DB | MongoDB + Mongoose |
| ML | Python, FastAPI |
| Queue | Bull + Redis (optional; WhatsApp jobs degrade gracefully) |
| PDF / QR | PDFKit, `qrcode`, UPI deep links |

## Quick start

### 1. MongoDB

Local: `mongodb://127.0.0.1:27017/billo`

### 2. Backend

```bash
cd backend
cp .env.example .env   # set secrets in production
npm install
npm run seed           # optional sample data — owner 9876543210 / PIN 4242
npm start
```

API: `http://localhost:4000` — health: `GET /health`

### 3. ML service

```bash
cd ml-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `ML_SERVICE_URL` in backend `.env`.

### 4. Mobile

```bash
cd mobile
npm install
npm run android
```

Dev API base in `mobile/src/api/client.ts` uses `http://10.0.2.2:4000` for the emulator.

## Documentation

- [docs/API.md](docs/API.md) — REST overview (see also inline routes under `backend/src/routes/`)
- [docs/BUILD_ANDROID.md](docs/BUILD_ANDROID.md) — APK build & signing
- [docs/GITHUB_RELEASES.md](docs/GITHUB_RELEASES.md) — OTA updates
- [docs/ML_TRAINING.md](docs/ML_TRAINING.md) — retraining notes

## Git commits

Use [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(invoice): add GST line totals`, `docs(readme): add SESD architecture`.

## License

Educational / project submission — adjust as needed.
