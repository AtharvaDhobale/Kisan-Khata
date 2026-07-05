<div align="center">

<img src="https://img.shields.io/badge/Farmoholic-Smart%20Farm%20Management-16a34a?style=for-the-badge&logo=leaf&logoColor=white" alt="Farmoholic Banner" />

<h1>🌾 Farmoholic</h1>

<p align="center">
  <strong>A modern, multilingual farm management web application for Indian farmers.</strong><br/>
  Track crop expenses, monitor live APMC mandi prices, and get AI agronomist advice — all in one powerful dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

<p align="center">
  <a href="https://farmoholic.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀%20Live%20Demo-farmoholic.vercel.app-16a34a?style=for-the-badge" />
  </a>
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Farmoholic** is a full-featured, offline-capable farm management Progressive Web Application designed specifically for Indian farmers. It addresses the core pain points of Indian agriculture — scattered expense tracking, opaque mandi price discovery, and lack of accessible agronomist guidance — by bringing everything into a single, intuitive dashboard.

Built with **React 19 + TypeScript + Vite**, it supports **9 Indian languages** and works seamlessly on both desktop and mobile devices.

---

## Key Features

| Feature | Description |
|---|---|
| 🌾 **Multi-Project Farm Tracking** | Create and manage multiple farm projects (Rabi/Kharif/Zaid) with individual budgets, crop types, land area, and sowing dates |
| 💸 **Smart Expense Logger** | Record and categorize expenses (seeds, fertilizers, tractor, labor, irrigation, transport, rent, misc) with date tracking |
| 📊 **Visual Analytics** | Interactive SVG donut chart for expense breakdown by category with real-time legend |
| 🏪 **Live Mandi Watch** | View APMC market prices for your crop across nearby mandis with trend indicators (↑↓) |
| 🤖 **AI Agronomist Advisor** | Rule-based AI recommendations for budget optimization, fertilizer usage, and profit maximization |
| 💬 **Multilingual Chatbot** | In-app farming assistant that responds in 9 Indian languages (Hindi, Marathi, Punjabi, Telugu, Tamil, Bengali, Kannada, Gujarati, English) |
| 📈 **Profitability Calculator** | Real-time ROI, net margin, and estimated profit calculations based on current mandi prices |
| 🌦️ **Weather-Aware Tips** | Location-based weather simulation with farming tip banners |
| 📄 **CSV Export & Print** | Export expense reports to CSV or print formatted reports |
| 📍 **Auto Geolocation** | Auto-detect state/district for relevant mandi data |
| 🌐 **9 Language Support** | Full UI translation in: English, Hindi, Marathi, Punjabi, Telugu, Tamil, Bengali, Kannada, Gujarati |
| 💾 **Offline-First** | All data persisted in `localStorage` — works without internet |

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

## Screenshots

> Live demo: [farmoholic.vercel.app](https://farmoholic.vercel.app)

| Dashboard | Project Form | Mandi Watch |
|---|---|---|
| Project overview with metrics, weather, and expense charts | Add/edit farm projects with crop, location, and budget | Real-time APMC mandi prices with profitability calculator |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/farmoholic.git
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
farmoholic/
├── public/                    # Static assets
│   └── favicon.svg
├── src/
│   ├── components/            # Reusable React components
│   │   ├── ProjectForm.tsx    # Farm project add/edit modal
│   │   ├── ExpenseForm.tsx    # Expense entry modal
│   │   ├── MandiWatchPanel.tsx # APMC price dashboard
│   │   └── AIAnalystPanel.tsx  # AI advisor + chatbot
│   ├── data/
│   │   ├── mandiData.ts       # APMC mock price data + crop configs
│   │   └── translations.ts    # Full i18n strings for 9 languages
│   ├── styles/
│   │   ├── variables.css      # Design token CSS variables
│   │   └── App.css            # Premium UI stylesheet
│   ├── utils/
│   │   └── helpers.ts         # Core logic: AI engine, storage, geolocation
│   ├── App.tsx                # Root application component
│   └── main.tsx               # React entry point
├── index.html                 # App shell with SEO meta tags + Google Fonts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Core Modules

### 🧠 AI Agronomist Engine (`utils/helpers.ts`)
The `generateAIAdvice()` function analyzes each farm project's financials and generates contextual advice in the farmer's preferred language. It evaluates:
- **Cost-per-acre vs. standard benchmarks** (crop-specific)
- **Category overspend** (fertilizers >30%, tractor >25%, labor >35%)
- **Profitability forecast** using live mandi prices

### 🏪 Mandi Data Engine (`data/mandiData.ts`)
Simulates real-time APMC data with state/district/crop filtering. Includes:
- `fetchMandiRates()` — location-aware price lookup
- `cropBasePrices` — standard cost, yield, and price ranges for 10+ Indian crops
- `fetchWeather()` — deterministic weather simulation by location

### 🌍 Translations (`data/translations.ts`)
Complete `TranslationSet` interface with 100+ keys, covering all UI strings in:
`en | hi | mr | pa | te | ta | bn | kn | gu`

---

## Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**Build Configuration:**
| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Manual Deploy

1. Run `npm run build`
2. Upload the `dist/` folder to any static hosting provider (Netlify, GitHub Pages, Cloudflare Pages)

---

## Supported Crops

| Crop | ID | Avg Yield/Acre | Standard Cost/Acre |
|---|---|---|---|
| Wheat | `wheat` | 15 Q | ₹14,000 |
| Paddy (Rice) | `paddy` | 18 Q | ₹18,000 |
| Maize (Corn) | `maize` | 20 Q | ₹12,000 |
| Cotton | `cotton` | 6 Q | ₹25,000 |
| Soybean | `soybean` | 10 Q | ₹15,000 |
| Sugarcane | `sugarcane` | 300 Q | ₹35,000 |
| Groundnut | `groundnut` | 8 Q | ₹20,000 |
| Onion | `onion` | 80 Q | ₹22,000 |
| Tomato | `tomato` | 120 Q | ₹28,000 |
| Chilli | `chilli` | 12 Q | ₹32,000 |

---

## Roadmap

- [ ] **PWA Support** — Service worker for true offline usage and home-screen install
- [ ] **Real APMC API** — Integration with [data.gov.in](https://data.gov.in) for live mandi prices
- [ ] **Cloud Sync** — Firebase/Supabase backend for cross-device data sync
- [ ] **Voice Input** — Web Speech API for hands-free expense logging
- [ ] **Loan Calculator** — Kisan Credit Card (KCC) EMI planner module
- [ ] **Harvest Scheduler** — Calendar view with crop-specific advisory timelines
- [ ] **Photo Receipts** — Camera capture for expense receipt storage

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add voice input for expenses'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for Indian Farmers — Jai Kisan 🌾**

<sub>Made with React • TypeScript • Vite • Vercel</sub>

</div>
