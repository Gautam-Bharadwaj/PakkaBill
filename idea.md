# NoteTrack Pro — Project Idea

## Problem Statement

Small wholesale notebook businesses manage dealers, billing, and payments manually (paper or spreadsheets), which leads to data entry errors, unclear outstanding balances, missed collections, and no visibility into profit or demand.

## Solution

**NoteTrack Pro** is a mobile-first business management system that centralizes dealer and product data, generates immutable invoices with PDF export and UPI QR codes, automates WhatsApp notifications, exposes ML-backed demand and pricing insights, and provides a real-time owner dashboard.

## Scope

- Dealer and product catalog management with credit limits and stock alerts
- Multi-line invoicing with GST, profit preview, and immutable invoice records
- Payment ledger with partial payments and automatic dealer balance updates
- Server-side PDF generation and dynamic UPI QR (amount + invoice reference)
- Queued WhatsApp messaging for invoices and payment updates
- ML microservice for demand forecasting, dealer segmentation, pricing hints, and low-margin detection
- Owner dashboard with revenue, profit, pending dues, and top products
- Optional in-app updates via GitHub Releases API

## Key Features

| Module | Features |
|--------|----------|
| Authentication | Phone + PIN, JWT access + refresh (refresh via httpOnly cookie supported) |
| Dealers | CRUD (soft delete), search/filter, credit utilization, purchase history |
| Products | Cost breakdown, auto manufacturing cost, margin %, low-stock alerts |
| Billing | Invoice preview, GST rates, credit checks, PDF + WhatsApp on create |
| Payments | Record cash/UPI/bank, update invoice and dealer pending amounts |
| Dashboard | MTD/YTD metrics, top products, pending dealers, ML insights cache |
| ML Service | Demand, dealer clustering, pricing optimization, low-margin detection |
| Mobile | Material Design 3, Android-first, secure token storage |

## Out of Scope

- Multi-tenant / multi-business support (single owner)
- Consumer e-commerce storefront or public ordering
- Automated procurement or supplier integration
- Full accounting / GST filing integration with government portals
