# Astro Unified - Architecture Document

## Overview

A unified astrology application combining Western natal astrology and Chinese Bazi (Four Pillars) with cross-reference analysis and compatibility features. Designed for fun social settings.

---

## PHASE 1: High-Level Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js / React)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Chart View   │  │ Bazi View    │  │ Cross-Reference View │  │
│  │ (SVG-based)  │  │ (Pillars)    │  │ (Combined Analysis)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Transit View │  │ Compatibility│  │ Social/Party Mode    │  │
│  │ (Today/Month)│  │ (A vs B)     │  │ (Fun Output)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                    (Node.js / Express)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Layer                                │ │
│  │  /api/chart/natal    - Generate Western birth chart        │ │
│  │  /api/chart/transit  - Calculate current transits          │ │
│  │  /api/bazi/calculate - Generate Four Pillars               │ │
│  │  /api/cross-ref      - Cross-reference analysis            │ │
│  │  /api/compatibility  - Compare two people                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 Calculation Engines                         │ │
│  │  ├── Western Astro Engine (astronomia/swiss-ephemeris)     │ │
│  │  ├── Bazi Engine (custom calculation)                      │ │
│  │  ├── Cross-Reference Engine (rule-based + LLM)             │ │
│  │  └── Interpretation Engine (templates + LLM enhancement)   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA / SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ Ephemeris Data  │  │ Chinese Calendar│  │ LLM Service     │ │
│  │ (Swiss Ephem)   │  │ (Lunar Tables)  │  │ (OpenAI/Local)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ Interpretation  │  │ Timezone/Geo    │                      │
│  │ Templates (JSON)│  │ (TimeZoneDB)    │                      │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

### Data Flow Diagrams

#### 1. Natal Chart Generation

```
User Input                    Processing                      Output
─────────────────────────────────────────────────────────────────────
Birth Date/Time/Location
        │
        ▼
┌─────────────────┐
│ Geocode Location│ ──► Lat/Long coordinates
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Swiss Ephemeris │ ──► Planet positions (longitude, sign, degree)
│ Calculation     │ ──► House cusps (using Placidus/Whole Sign)
└─────────────────┘ ──► Aspects (conjunctions, squares, trines, etc.)
        │
        ▼
┌─────────────────┐
│ Pattern Detector│ ──► Grand Trine, T-Square, Stellium, etc.
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Interpretation  │ ──► Sign meanings, house placements, aspect interpretations
│ Engine          │
└─────────────────┘
        │
        ▼
JSON Response: { planets, houses, aspects, patterns, interpretations }
```

#### 2. Transit Calculation

```
User's Natal Chart + Current Date
        │
        ▼
┌─────────────────┐
│ Current Planet  │ ──► Today's planet positions
│ Positions       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Transit Aspect  │ ──► Which transiting planets aspect natal planets
│ Calculator      │ ──► Orb tolerance (typically 1-3°)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Transit Impact  │ ──► "Saturn conjunct natal Moon" = emotional challenges
│ Interpreter     │ ──► Duration, intensity, themes
└─────────────────┘
        │
        ▼
JSON Response: { activeTransits, themes, duration, advice }
```

#### 3. Bazi Calculation

```
Birth Date/Time (Solar)
        │
        ▼
┌─────────────────┐
│ Solar → Lunar   │ ──► Convert to Chinese lunar calendar
│ Conversion      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Four Pillars    │ ──► Year Pillar (Heavenly Stem + Earthly Branch)
│ Calculator      │ ──► Month Pillar
└─────────────────┘ ──► Day Pillar (Day Master = core identity)
        │          ──► Hour Pillar
        ▼
┌─────────────────┐
│ Ten Gods        │ ──► Relationship of each element to Day Master
│ Calculator      │ ──► (Rob Wealth, Hurting Officer, etc.)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Element Balance │ ──► Count of Wood, Fire, Earth, Metal, Water
│ Analyzer        │ ──► Missing elements, dominant elements
└─────────────────┘
        │
        ▼
JSON Response: { pillars, tenGods, elementBalance, interpretation }
```

#### 4. Cross-Reference Logic

```
Western Chart Data + Bazi Data
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    MAPPING LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Western Fire Signs (Aries, Leo, Sag) ◄──► Chinese Fire     │
│  Western Earth Signs (Taurus, Virgo, Cap) ◄──► Chinese Earth│
│  Western Air Signs (Gemini, Libra, Aqua) ◄──► Chinese Metal*│
│  Western Water Signs (Cancer, Scorpio, Pisces) ◄──► Chinese Water│
│  * Air→Metal is approximate; Air also relates to Wood (growth)│
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ Pattern Matcher │ ──► Reinforcing: Western Fire + Bazi Fire dominant
└─────────────────┘ ──► Conflicting: Western Water + Bazi Fire lacking
        │
        ▼
┌─────────────────┐
│ Theme Extractor │ ──► Common themes (leadership, creativity, etc.)
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ LLM Enhancement │ ──► Generate readable, non-generic interpretation
└─────────────────┘
        │
        ▼
JSON Response: { mappings, reinforcing, conflicting, synthesis }
```

#### 5. Compatibility Logic

```
Person A Data + Person B Data
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  WESTERN SYNASTRY                            │
├─────────────────────────────────────────────────────────────┤
│  • Sun-Moon contacts (emotional compatibility)              │
│  • Venus-Mars contacts (attraction)                         │
│  • Mercury aspects (communication)                          │
│  • Saturn aspects (longevity, challenges)                   │
│  • Composite chart (relationship as entity)                 │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                  BAZI COMPATIBILITY                          │
├─────────────────────────────────────────────────────────────┤
│  • Day Master harmony (productive vs destructive cycle)     │
│  • Branch combinations (六合 Liu He, 三合 San He)            │
│  • Branch clashes (六冲 Liu Chong)                          │
│  • Element balance complementarity                          │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ Score Aggregator│ ──► Weighted scoring system
└─────────────────┘ ──► Western: 50%, Bazi: 50% (configurable)
        │
        ▼
┌─────────────────┐
│ Compatibility   │ ──► Strengths, challenges, advice
│ Report Generator│ ──► Fun social-friendly summary
└─────────────────┘
        │
        ▼
JSON Response: { overallScore, westernScore, baziScore, strengths, challenges, funSummary }
```

---

### Recommended Tech Stack

#### Frontend
| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | **Next.js 14** | SSR, API routes, React ecosystem |
| Styling | **Tailwind CSS** | Rapid UI development |
| Charts | **D3.js or Custom SVG** | Full control over astrological chart rendering |
| State | **Zustand** | Lightweight state management |
| Forms | **React Hook Form** | Date/time/location inputs |

#### Backend
| Component | Technology | Reason |
|-----------|------------|--------|
| Runtime | **Node.js** | JavaScript ecosystem |
| Framework | **Express** or **Next.js API Routes** | Simple REST API |
| Astro Calc | **astronomia** or **swisseph** | Accurate ephemeris calculations |
| Bazi Calc | **Custom module** | Based on open algorithms |
| LLM | **OpenAI API** (optional) | Interpretation enhancement |

#### Data Sources
| Data | Source | License |
|------|--------|---------|
| Ephemeris | Swiss Ephemeris (swisseph) | GPL for free use |
| Timezone | **TimeZoneDB** or **Luxon** | Free API / MIT |
| Geocoding | **OpenStreetMap Nominatim** | ODbL (free) |
| Chinese Calendar | **lunar-javascript** | MIT |
| Interpretations | **Self-authored templates** | Original content |

---

### Legal Considerations

#### ✅ Safe to Use
- **Swiss Ephemeris**: Open source (GPL/AGPL for free, commercial license available)
- **Astronomical calculations**: Math/algorithms are not copyrightable
- **Chinese calendar algorithms**: Public domain mathematical formulas
- **Self-written interpretations**: Original content you own

#### ⚠️ Avoid
- Scraping astrology websites (Astro.com, Cafe Astrology, etc.)
- Copying interpretation text from books without permission
- Using proprietary databases without license

#### 📋 Approach
1. Write original interpretation templates (or use LLM to generate)
2. Use open-source calculation libraries
3. No external API calls to astrology services
4. All chart logic calculated locally

---

### Model Strategy (LLM Usage)

#### Where LLM is Needed

| Feature | LLM Role | Alternative |
|---------|----------|-------------|
| Interpretation text | Enhance templates with natural language | Static templates (less engaging) |
| Cross-reference synthesis | Connect Western + Bazi themes meaningfully | Rule-based mapping (more mechanical) |
| Compatibility narrative | Generate fun, personalized summaries | Template-based (more generic) |
| Social/Party mode | Witty, entertaining output | Pre-written jokes/quips |

#### LLM Integration Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                  HYBRID APPROACH                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  RULE-BASED LAYER (Always runs first)                       │
│  ├── Calculate exact positions                              │
│  ├── Detect patterns mathematically                         │
│  ├── Map Western ↔ Chinese elements                         │
│  └── Generate structured data                               │
│                                                              │
│  LLM LAYER (Enhancement, optional)                          │
│  ├── Input: Structured data from rule layer                 │
│  ├── Task: Generate natural language interpretation         │
│  ├── Constraints: No hallucinating positions/aspects        │
│  └── Output: Readable paragraphs                            │
│                                                              │
│  FALLBACK (If no LLM available)                             │
│  └── Use pre-written template library                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Prompt Engineering for Astrology LLM

```
System: You are an astrology interpreter. You receive structured 
chart data and produce engaging, accurate interpretations.

Rules:
- Never invent planetary positions or aspects
- Base all statements on the provided data
- Be specific to THIS chart, not generic
- For social mode: be witty and fun, not preachy
- Acknowledge both Western and Chinese perspectives

Input Format:
{
  "western": { planets, aspects, patterns },
  "bazi": { pillars, tenGods, elements },
  "crossRef": { mappings, reinforcing, conflicting }
}

Output: Natural language interpretation (2-3 paragraphs)
```

---

## Summary

This architecture:
1. **Calculates everything locally** - no API dependencies for astro data
2. **Uses open-source libraries** - legally safe
3. **Hybrid LLM approach** - works with or without AI
4. **Clean separation** - frontend/backend/calculation engines
5. **Solo-dev friendly** - not over-engineered

---

*Document Version: 1.0*
*Phase: 1 - Architecture Design*
