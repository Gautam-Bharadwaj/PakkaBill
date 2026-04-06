# 📦 PAKKABILL | Industrial Billing Engine

**Carbon Dark Edition: Black, White, and Orange.**

PakkaBill is a high-performance, industrial-grade mobile billing and inventory management application designed for modern wholesalers and retailers. Built with extreme contrast and efficiency, it provides a "Command Center" experience for managing sales, revenue, and customer accounts.

---

## 🎨 Design System: Carbon Dark
PakkaBill uses a bespoke **Carbon Dark** aesthetic optimized for high-impact visibility and efficiency:
- **Primary Accent**: Electric Orange (`#FF6B00`) for high-reach actions and trend indicators.
- **Background**: Pure Carbon Black (`#000000`) for battery conservation and contrast.
- **Surface**: Deep Slate (`#121212`) for card depth and data separation.
- **Typography**: Heavy, industrial-style bold weights and uppercase headers.

---

## 📱 Key Features
- **⚡ Command Center (Dashboard)**: Real-time MTD revenue tracking with dynamic growth indicators.
- **⚙️ Billing Engine**: Industrial-strength bill generation with GST compliance, SKU management, and discount automation.
- **📈 Growth Analytics**: Precision trend tracking and product performance SKU meters.
- **📜 Digital Receipt**: High-contrast, industrial-style digital receipts with WhatsApp sharing and PDF generation.
- **🔒 Secure Console**: Professional PIN-based login (Pattern: Carbon Industrial).

---

## 🔐 Access Credentials
> [!IMPORTANT]
> **Default Admin PIN**: **`123456`**

---

## 🛠️ Technology Stack
- **Mobile Hardware**: React Native (via Expo), Expo Router.
- **Backend Architecture**: Node.js, Express.js.
- **Persistence Layer**: MongoDB (Mongoose).
- **Communication**: Axios, WhatsApp API integration.
- **UI/UX Framework**: Reanimated, Skia, Victory Native (for Industrial Analytics).

---

## 🚀 Deployment Instructions

### 1. Backend Persistence Server (Port 5001)
```bash
cd backend
npm install
npm run dev
```

### 2. Mobile Client (Carbon Studio)
```bash
cd mobile
npm install
npx expo start
```
*Ensure you update the `.env` with your current local IP to sync with the backend.*

---

## 🏛 Architecture
- `/mobile`: High-contrast industrial UI and billing logic.
- `/backend`: Scalable API and transaction processing.
- `/web`: (Under Maintenance) Centralized administration dashboard.

---

*Redesigned for Gautam Bharadwaj by Antigravity Studio.*
