# Astro Unified

A unified astrology application combining **Western natal astrology** and **Chinese Bazi (Four Pillars of Destiny)** with cross-reference analysis and compatibility features.

Built for fun social settings like dinner parties.

🔗 **Live Demo:** [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https://github.com/andrikevineric/astro-unified)

## Features

### Core
- **Western Natal Chart** - Interactive SVG wheel with planets, houses, aspects
- **Chart Pattern Detection** - Grand Trine, T-Square, Stellium, etc.
- **Bazi Four Pillars** - Year, Month, Day, Hour pillars with Ten Gods
- **Five Elements Balance** - Visual breakdown of elemental distribution

### Cross-Reference
- **East-West Mapping** - Connects Western elements to Chinese Five Elements
- **Harmony Score** - How well the two systems align for you
- **Reinforcing Patterns** - Themes confirmed by both traditions
- **Balancing Patterns** - Where one system compensates the other

### Social
- **Compatibility Mode** - Compare two people's charts
- **Party Mode** - Fun, shareable one-liners
- **Current Transits** - Today's cosmic weather

## Getting Started

### Local Development
```bash
npm install
npm run dev
```
Open http://localhost:3000

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/andrikevineric/astro-unified)

## Project Structure

```
astro-unified/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Main app with 4 tabs
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── components/
│       ├── NatalChart.tsx      # SVG wheel chart
│       ├── BaziPanel.tsx       # Four Pillars display
│       ├── CrossReference.tsx  # East-West analysis
│       ├── CompatibilityForm.tsx
│       └── BirthDataForm.tsx
├── backend/              # Reference API implementation (not deployed)
│   └── src/
│       ├── engines/      # Calculation logic
│       └── routes/       # API endpoints
├── ARCHITECTURE.md       # System design & data flow
├── FEATURES.md          # Feature breakdown & UX specs
└── CROSS-REFERENCE.md   # Scoring algorithms & logic
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| State | Zustand |
| Charts | Custom SVG rendering |
| Deployment | Vercel |

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, data flow diagrams
- **[FEATURES.md](./FEATURES.md)** - Detailed feature specs
- **[CROSS-REFERENCE.md](./CROSS-REFERENCE.md)** - Scoring algorithms

## Current Status

This is a **frontend prototype** with mock data demonstrating:
- [x] UI layout and navigation
- [x] Western natal chart visualization
- [x] Bazi Four Pillars display
- [x] Cross-reference analysis view
- [x] Compatibility comparison

### Not Yet Implemented
- [ ] Actual ephemeris calculations (using mock data)
- [ ] Real Bazi calculations (using mock data)
- [ ] LLM integration for interpretations
- [ ] User authentication
- [ ] Saved charts

## License

MIT

---

*Built with curiosity about how different astrological traditions see the same person.*
