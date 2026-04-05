# NoteTrack Pro REST API

Base URL: `http://localhost:4000`. Protected routes require `Authorization: Bearer <access_token>`.  
Refresh token: send JSON body `{ "refreshToken" }` **or** rely on httpOnly cookie `refreshToken` (set on login/refresh).

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | First owner only |
| POST | `/api/auth/login` | PIN login → JWT + refresh cookie |
| POST | `/api/auth/refresh` | New access + refresh |
| POST | `/api/auth/logout` | Protected — clears refresh cookie |

## Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/summary` | MTD/YTD, pending, top products, recent invoices, low stock, ML cache |
| GET | `/api/dashboard/top-products` | By quantity & profit |
| GET | `/api/dashboard/pending-dealers` | Dealers with dues |
| GET | `/api/dashboard/ml-insights` | Cached ML document |

## Dealers

| Method | Path |
|--------|------|
| GET | `/api/dealers` |
| POST | `/api/dealers` |
| GET | `/api/dealers/:id` |
| PUT | `/api/dealers/:id` |
| DELETE | `/api/dealers/:id` |
| GET | `/api/dealers/:id/invoices` |
| GET | `/api/dealers/:id/payments` |

## Products

| Method | Path |
|--------|------|
| GET | `/api/products` |
| POST | `/api/products` |
| GET | `/api/products/:id` |
| PUT | `/api/products/:id` |
| DELETE | `/api/products/:id` (archive) |

## Invoices

| Method | Path |
|--------|------|
| POST | `/api/invoices/preview` |
| POST | `/api/invoices` |
| GET | `/api/invoices` |
| GET | `/api/invoices/:id` |
| GET | `/api/invoices/:id/pdf` |
| GET | `/api/invoices/:id/upi-qr.png` |
| POST | `/api/invoices/:id/send-whatsapp` |
| GET | `/api/invoices/:id/payments` |

## Payments

| Method | Path |
|--------|------|
| POST | `/api/payments` |
| GET | `/api/payments` |
| GET | `/api/payments/:invoiceId/qr` | UPI QR PNG for **invoice** `_id` |

## ML proxy

| Method | Path |
|--------|------|
| POST | `/api/ml/demand` |
| POST | `/api/ml/dealer-segments` |
| POST | `/api/ml/pricing` |
| GET | `/api/ml/low-margin` |

## Health

`GET /health` → `{ "ok": true }`
