<div align="center">

<img src="https://img.shields.io/badge/किसान%20खाता-Kisan%20Khata-16a34a?style=for-the-badge&logo=leaf&logoColor=white" alt="Kisan Khata Banner" />

<h1>🌾 Kisan Khata — किसान खाता</h1>

<p align="center">
  <strong>किसान का डिजिटल खाता बही — The Farmer's Digital Ledger</strong><br/>
  A modern, multilingual farm management web application for Indian farmers.<br/>
  Track crop expenses · Monitor live APMC mandi prices · Get AI agronomist advice
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Languages-9%20Indian-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

<p align="center">
  <a href="https://kisan-khata.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-kisan--khata.vercel.app-16a34a?style=for-the-badge" />
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/AtharvaDhobale/farmoholic" target="_blank">
    <img src="https://img.shields.io/badge/📦%20Source%20Code-GitHub-181717?style=for-the-badge&logo=github" />
  </a>
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Why Kisan Khata?](#why-kisan-khata)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Supported Crops](#supported-crops)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Kisan Khata** (किसान खाता — *Farmer's Account Book*) is a full-featured, offline-capable farm management Progressive Web Application built specifically for Indian farmers.

The name says it all: every Indian farmer knows what a **khata** (खाता) is — it's the handwritten account book kept for every expense and income. Kisan Khata brings that into the digital age.

Built with **React 19 + TypeScript + Vite**, it supports **9 Indian languages** and works seamlessly on both desktop and mobile.

---

## Why Kisan Khata?

Indian farmers face 3 core problems this app solves:

| Problem | Kisan Khata Solution |
|---|---|
| 📒 Scattered paper expense tracking | Digital expense logger with 8 categories |
| 💰 No visibility into mandi prices | Live APMC rate ticker for 8 states |
| 🤔 No agronomist guidance available | AI-powered farming advisor in your language |

---

## Key Features

| Feature | Description |
|---|---|
| 🌾 **Multi-Project Farm Tracking** | Manage multiple farm projects (Rabi/Kharif/Zaid) with individual budgets, crop types, land area, and sowing dates |
| 💸 **Smart Expense Logger** | Record expenses across 8 categories: seeds, fertilizers, tractor, labor, irrigation, transport, rent, miscellaneous |
| 📊 **Visual Analytics** | Interactive SVG donut chart showing expense breakdown by category with real-time legend |
| 🏪 **Live Mandi Watch** | APMC market prices for your crop across nearby mandis with trend indicators (↑↓) |
| 🤖 **AI Agronomist Advisor** | Rule-based AI recommendations for budget optimization, fertilizer usage, and profit maximization |
| 💬 **Multilingual Chatbot** | In-app farming assistant responding in 9 Indian languages |
| 📈 **Profitability Calculator** | Real-time ROI, net margin, and estimated profit using current mandi prices |
| 🌦️ **Weather-Aware Tips** | Location-based weather simulation with farming tip banners |
| 📄 **CSV Export & Print** | Export expense reports to CSV or print formatted reports |
| 📍 **Auto Geolocation** | Auto-detect state/district for relevant mandi data |
| 🌐 **9 Language Support** | English · हिंदी · मराठी · ਪੰਜਾਬੀ · తెలుగు · தமிழ் · বাংলা · ಕನ್ನಡ · ગુજરાતી |
| 💾 **Offline-First** | All data in `localStorage` — works without internet |

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 19 with TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Vanilla CSS with CSS Custom Properties (no UI library) |
| **Icons** | Lucide React |
| **State Management** | React Hooks (`useState`, `useEffect`, `useRef`) |
| **Data Persistence** | Browser `localStorage` |
| **Type Safety** | TypeScript 5.x with strict mode |
| **Linting** | OxLint (ultra-fast Rust-based linter) |
| **Deployment** | Vercel (zero-config, Edge Network) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AtharvaDhobale/farmoholic.git
cd farmoholic

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server with HMR |
| `npm run build` | Build production bundle (`dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run OxLint static analysis |

---

## Project Structure

```
farmoholic/                        # Kisan Khata source repo
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ProjectForm.tsx        # Farm project add/edit modal
│   │   ├── ExpenseForm.tsx        # Expense entry modal
│   │   ├── MandiWatchPanel.tsx    # APMC mandi price dashboard
│   │   └── AIAnalystPanel.tsx     # Kisan Khata AI advisor + chatbot
│   ├── data/
│   │   ├── mandiData.ts           # APMC mock price data + crop configs
│   │   └── translations.ts        # Full i18n for 9 Indian languages
│   ├── styles/
│   │   ├── variables.css          # Design token CSS variables
│   │   └── App.css                # Premium UI stylesheet
│   ├── utils/
│   │   └── helpers.ts             # Core logic: AI engine, storage, geolocation
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React entry point
├── index.html                     # SEO meta + Google Fonts
├── vercel.json                    # Vercel deployment config
├── vite.config.ts
└── package.json
```

---

## Core Modules

### 🧠 AI Advisor Engine (`utils/helpers.ts`)
`generateAIAdvice()` analyzes each farm project and generates contextual advice in the farmer's preferred language. Evaluates:
- **Cost-per-acre vs crop benchmarks**
- **Category overspend** (fertilizers >30%, tractor >25%, labor >35%)
- **Profitability forecast** using live mandi prices

### 🏪 Mandi Data Engine (`data/mandiData.ts`)
Simulates real-time APMC data with state/district/crop filtering:
- `fetchMandiRates()` — location-aware price lookup
- `cropBasePrices` — standard cost, yield, and price ranges for 10+ Indian crops
- `fetchWeather()` — deterministic weather simulation by location

### 🌍 Translations (`data/translations.ts`)
Complete `TranslationSet` covering all UI strings in 9 languages:

| Code | Language | App Title |
|---|---|---|
| `en` | English | Kisan Khata |
| `hi` | हिंदी | किसान खाता |
| `mr` | मराठी | किसान खाता |
| `pa` | ਪੰਜਾਬੀ | ਕਿਸਾਨ ਖਾਤਾ |
| `te` | తెలుగు | కిసాన్ ఖాతా |
| `ta` | தமிழ் | கிசான் காத்தா |
| `bn` | বাংলা | কিসান খাতা |
| `kn` | ಕನ್ನಡ | ಕಿಸಾನ್ ಖಾತಾ |
| `gu` | ગુજરાતી | કિસાન ખાતા |

---

## Supported Crops

| Crop | ID | Avg Yield/Acre | Standard Cost/Acre |
|---|---|---|---|
| Wheat (गेहूं) | `wheat` | 15 Q | ₹14,000 |
| Paddy/Rice (धान) | `paddy` | 18 Q | ₹18,000 |
| Maize (मक्का) | `maize` | 20 Q | ₹12,000 |
| Cotton (कपास) | `cotton` | 6 Q | ₹25,000 |
| Soybean (सोयाबीन) | `soybean` | 10 Q | ₹15,000 |
| Sugarcane (गन्ना) | `sugarcane` | 300 Q | ₹35,000 |
| Groundnut (मूंगफली) | `groundnut` | 8 Q | ₹20,000 |
| Onion (प्याज) | `onion` | 80 Q | ₹22,000 |
| Tomato (टमाटर) | `tomato` | 120 Q | ₹28,000 |
| Chilli (मिर्च) | `chilli` | 12 Q | ₹32,000 |

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login (if not already)
vercel login

# Deploy to production
vercel --prod --yes
```

**Build Configuration:**

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## Roadmap

- [ ] **PWA Support** — Service worker for offline usage and home-screen install
- [ ] **Real APMC API** — Integration with data.gov.in for live mandi prices
- [ ] **Cloud Sync** — Firebase/Supabase backend for cross-device data sync
- [ ] **Voice Input** — Web Speech API for hands-free expense logging in Hindi
- [ ] **Loan Calculator** — Kisan Credit Card (KCC) EMI planner module
- [ ] **Harvest Scheduler** — Calendar view with crop-specific advisory timelines
- [ ] **Photo Receipts** — Camera capture for expense receipt storage
- [ ] **SMS Alerts** — Mandi price alerts via SMS for farmers without smartphones

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit with conventional commits: `git commit -m 'feat: add voice input'`
4. Push: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**जय किसान 🌾 — Built with ❤️ for Indian Farmers**

<sub>Kisan Khata · किसान खाता · React · TypeScript · Vite · Vercel</sub>

</div>
