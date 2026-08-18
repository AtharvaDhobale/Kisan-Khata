<div align="center">

<h1>ðŸŒ¾ Kisan Khata â€” à¤•à¤¿à¤¸à¤¾à¤¨ à¤–à¤¾à¤¤à¤¾</h1>

<p align="center">
  <strong>à¤•à¤¿à¤¸à¤¾à¤¨ à¤•à¤¾ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤–à¤¾à¤¤à¤¾ à¤¬à¤¹à¥€ â€” The Farmer's Digital Ledger</strong><br/>
  Farm expense tracking Â· Live APMC mandi prices Â· AI agronomist advice<br/>
  Built for Indian farmers in 9 regional languages.
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
    <img src="https://img.shields.io/badge/Live%20Demo-kisan--khata.vercel.app-16a34a?style=for-the-badge" />
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/AtharvaDhobale/Kisan-Khata" target="_blank">
    <img src="https://img.shields.io/badge/Source%20Code-GitHub-181717?style=for-the-badge&logo=github" />
  </a>
</p>

</div>

---

## Overview

**Kisan Khata** is a farm management web app built for Indian farmers. Every farmer knows what a *khata* is â€” the handwritten account book kept for every expense and income. This project brings that into the browser.

Built with React 19 + TypeScript + Vite, it supports 9 Indian languages and a Spring Boot backend. The app runs fully offline using localStorage when the backend is unavailable.

---

## Why I built this

Most farm apps require constant internet or are English-only. Three problems I focused on solving:

| Problem | How Kisan Khata handles it |
|---|---|
| Paper-based expense tracking | Digital ledger with 8 expense categories |
| No mandi rate visibility | Live APMC price ticker for 8 states |
| No agronomist access | Rule-based AI advisor in the farmer's own language |

---

## Features

| Feature | Description |
|---|---|
| Multi-Project Farm Tracking | Manage Rabi/Kharif/Zaid projects with budgets, crop type, land area, sowing dates |
| Expense Logger | 8 categories: seeds, fertilizers, tractor, labor, irrigation, transport, rent, misc |
| Visual Analytics | SVG donut chart showing expense breakdown per category |
| Mandi Watch | APMC market prices across nearby mandis with trend indicators |
| AI Agronomist | Rule-based recommendations for budget, fertilizer use, and profit |
| Multilingual Chatbot | In-app farming assistant in 9 Indian languages |
| Profit Calculator | Real-time ROI, net margin, and estimated profit |
| Weather Tips | Location-based weather simulation with farming tip banners |
| CSV Export & Print | Export expense reports or print formatted summaries |
| Geolocation | Auto-detect state/district for relevant mandi data |
| 9 Languages | English, Hindi, Marathi, Punjabi, Telugu, Tamil, Bengali, Kannada, Gujarati |
| Offline-first | All data in localStorage â€” works without internet |

---

## Tech Stack

| Category | Choice |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Vanilla CSS with CSS Custom Properties |
| Icons | Lucide React |
| State | React Hooks |
| Persistence | Browser localStorage |
| Linting | OxLint |
| Deployment | Vercel |

---

## Running locally

### Prerequisites
- Node.js >= 18.x
- Java 17 + Maven 3.8+ (only if running the Spring Boot backend)

### Frontend only

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Works fully offline with localStorage.

### Full stack (frontend + Spring Boot backend)

```bash
# Terminal 1 - backend
mvn spring-boot:run

# Terminal 2 - frontend
npm install
npm run dev
```

H2 console: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:kisankhata | Username: sa | Password: (leave blank)

### Production build

```bash
npm run build
mvn package
java -jar target/kisan-khata-0.0.1-SNAPSHOT.jar
```

---

## Project Structure

```
Kisan-Khata/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ ProjectForm.tsx        # Add/edit farm project modal
â”‚   â”‚   â”œâ”€â”€ ExpenseForm.tsx        # Expense entry modal
â”‚   â”‚   â”œâ”€â”€ MandiWatchPanel.tsx    # APMC mandi price dashboard
â”‚   â”‚   â””â”€â”€ AIAnalystPanel.tsx     # AI advisor + chatbot
â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â”œâ”€â”€ mandiData.ts           # APMC mock prices + crop configs
â”‚   â”‚   â””â”€â”€ translations.ts        # i18n for 9 Indian languages
â”‚   â”œâ”€â”€ styles/
â”‚   â”‚   â”œâ”€â”€ variables.css
â”‚   â”‚   â””â”€â”€ App.css
â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â””â”€â”€ helpers.ts             # AI engine, storage, geolocation
â”‚   â”œâ”€â”€ App.tsx
â”‚   â””â”€â”€ main.tsx
â”œâ”€â”€ vercel.json
â”œâ”€â”€ vite.config.ts
â””â”€â”€ package.json
```

---

## Supported Crops

| Crop | Avg Yield/Acre | Standard Cost/Acre |
|---|---|---|
| Wheat | 15 Q | Rs.14,000 |
| Paddy/Rice | 18 Q | Rs.18,000 |
| Maize | 20 Q | Rs.12,000 |
| Cotton | 6 Q | Rs.25,000 |
| Soybean | 10 Q | Rs.15,000 |
| Sugarcane | 300 Q | Rs.35,000 |
| Groundnut | 8 Q | Rs.20,000 |
| Onion | 80 Q | Rs.22,000 |
| Tomato | 120 Q | Rs.28,000 |
| Chilli | 12 Q | Rs.32,000 |

---

## What's next

- [ ] PWA service worker for offline install
- [ ] Real APMC API (data.gov.in)
- [ ] Firebase/Supabase for cross-device sync
- [ ] Voice input in Hindi via Web Speech API
- [ ] Kisan Credit Card (KCC) EMI planner
- [ ] Harvest calendar with crop advisory timelines
- [ ] Photo receipt capture

---

## License

MIT

---

<div align="center">
<strong>Jai Kisan - Built for Indian Farmers</strong><br/>
<sub>React Â· TypeScript Â· Vite Â· Vercel</sub>
</div>