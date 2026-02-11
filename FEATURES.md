# Astro Unified - Feature Breakdown

## PHASE 2: Feature Definitions

---

## Core Features

### 1. Birth Chart Visualization

**Description**: Interactive Western natal chart display (wheel format)

**Components**:
- SVG-based zodiac wheel (12 signs)
- Planet glyphs positioned by degree
- House divisions (12 houses)
- Aspect lines connecting planets (color-coded)
- Chart patterns highlighted (Grand Trine, T-Square, etc.)

**Interactions**:
- Click planet → Show detailed panel (sign, house, degree, interpretation)
- Click aspect line → Show aspect interpretation
- Click pattern → Show pattern meaning
- Hover → Quick tooltip preview

**Data Displayed**:
```
Planet: Sun
Sign: Leo (15°23')
House: 10th House
Interpretation: "Leadership presence in career..."
```

---

### 2. Chart Pattern Detection

**Patterns to Detect**:

| Pattern | Definition | Meaning |
|---------|------------|---------|
| **Stellium** | 3+ planets in one sign/house | Concentrated energy |
| **Grand Trine** | 3 planets forming equilateral triangle (120° apart) | Natural talent, ease |
| **T-Square** | 2 planets opposite, both square a 3rd | Tension, drive |
| **Grand Cross** | 4 planets in square/opposition pattern | Major life challenges |
| **Yod** | 2 planets sextile, both quincunx a 3rd | Fated turning point |
| **Kite** | Grand Trine + opposition to one point | Focused talent |
| **Mystic Rectangle** | 2 oppositions connected by sextiles/trines | Creative tension |

**Display**: Patterns listed in sidebar, highlighted on chart when selected

---

### 3. Bazi Four Pillars Display

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                    FOUR PILLARS                          │
├──────────┬──────────┬──────────┬──────────┬────────────┤
│  HOUR    │   DAY    │  MONTH   │   YEAR   │            │
├──────────┼──────────┼──────────┼──────────┤            │
│    癸    │    甲    │    丙    │    壬    │  Heavenly  │
│   Gui    │   Jia    │   Bing   │   Ren    │   Stems    │
│  (Water) │  (Wood)  │  (Fire)  │  (Water) │            │
├──────────┼──────────┼──────────┼──────────┤            │
│    亥    │    子    │    寅    │    辰    │  Earthly   │
│   Hai    │    Zi    │   Yin    │   Chen   │  Branches  │
│  (Pig)   │  (Rat)   │ (Tiger)  │ (Dragon) │            │
└──────────┴──────────┴──────────┴──────────┴────────────┘
                        ▲
                   Day Master
              (Core Identity: 甲 Jia Wood)
```

**Click interactions**:
- Click any pillar → Show detailed interpretation
- Click Day Master → Show personality overview

---

### 4. Chinese Elements & Ten Gods

**Element Balance Display**:
```
┌────────────────────────────────────────┐
│         ELEMENT BALANCE                 │
├────────────────────────────────────────┤
│  🌳 Wood   ████████░░░░  3 (Strong)   │
│  🔥 Fire   ██░░░░░░░░░░  1 (Weak)     │
│  🏔 Earth  ████░░░░░░░░  2 (Balanced)  │
│  🔩 Metal  ██████░░░░░░  2 (Balanced)  │
│  💧 Water  ████████████  4 (Dominant)  │
└────────────────────────────────────────┘
```

**Ten Gods Table**:
| God | Chinese | Relationship | Meaning |
|-----|---------|--------------|---------|
| Rob Wealth | 劫財 | Same element, diff polarity | Competition, siblings |
| Eating God | 食神 | Element you produce, same polarity | Creativity, children |
| Hurting Officer | 傷官 | Element you produce, diff polarity | Rebellion, talent |
| Direct Wealth | 正財 | Element you control, diff polarity | Steady income, wife |
| Indirect Wealth | 偏財 | Element you control, same polarity | Windfall, father |
| Direct Officer | 正官 | Element that controls you, diff polarity | Authority, structure |
| 7 Killings | 七殺 | Element that controls you, same polarity | Pressure, ambition |
| Direct Resource | 正印 | Element that produces you, diff polarity | Support, mother |
| Indirect Resource | 偏印 | Element that produces you, same polarity | Unconventional learning |

---

### 5. Western + Chinese Cross-Reference Engine

**Mapping System**:

```
WESTERN ELEMENTS          CHINESE FIVE ELEMENTS
─────────────────         ─────────────────────
Fire (Aries, Leo, Sag)    ──────►  Fire (火)
                          
Earth (Taurus, Virgo, Cap) ────►  Earth (土)

Air (Gemini, Libra, Aqua)  ────►  Metal (金) + Wood (木)*
                          
Water (Cancer, Scorp, Pisc) ───►  Water (水)

* Air maps to Metal (intellectual, social) and Wood (ideas, growth)
```

**Cross-Reference Output**:
```
┌─────────────────────────────────────────────────────────┐
│              CROSS-REFERENCE ANALYSIS                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔗 REINFORCING PATTERNS                                │
│  ├── Sun in Leo (Fire) + Bazi Fire present             │
│  │   → Strong creative/leadership energy in both systems│
│  ├── Moon in Cancer (Water) + Bazi Water dominant      │
│  │   → Emotional depth confirmed across traditions      │
│                                                          │
│  ⚡ BALANCING PATTERNS                                   │
│  ├── Mars in Capricorn (Earth) + Bazi lacks Earth      │
│  │   → Western chart compensates for Chinese deficiency │
│                                                          │
│  💫 UNIQUE INSIGHTS                                      │
│  └── "Your Western Fire Sun drives you to lead,        │
│       while your Bazi Water dominance gives you the    │
│       flexibility to adapt your leadership style."      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 6. Compatibility Mode (Person A vs Person B)

**Input**: Two people's birth data

**Western Synastry Scores**:
- Emotional Bond (Sun-Moon aspects): 0-100
- Attraction (Venus-Mars aspects): 0-100
- Communication (Mercury aspects): 0-100
- Longevity (Saturn aspects): 0-100

**Bazi Compatibility Scores**:
- Day Master Harmony: 0-100 (productive cycle = high)
- Branch Combinations: 0-100 (六合/三合 = bonus)
- Element Complementarity: 0-100 (fills each other's gaps)

**Overall Dashboard**:
```
┌─────────────────────────────────────────────────────────┐
│           COMPATIBILITY: Alex + Jordan                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Overall Match: ████████████████░░░░  78%              │
│                                                          │
│   Western Synastry                                       │
│   ├── Emotional   ████████████████████  92%             │
│   ├── Attraction  ██████████████░░░░░░  70%             │
│   ├── Communication ████████████░░░░░░  65%             │
│   └── Longevity   ████████████████░░░░  80%             │
│                                                          │
│   Bazi Harmony                                           │
│   ├── Day Masters  ████████████████░░░░  78%            │
│   ├── Branches     ██████████████████░░  85%            │
│   └── Elements     ████████████░░░░░░░░  60%            │
│                                                          │
│   💪 Strengths:                                          │
│   • Deep emotional understanding                         │
│   • Strong physical chemistry                            │
│   • Branch combination (寅亥合) adds harmony            │
│                                                          │
│   ⚠️ Watch Out For:                                      │
│   • Communication styles differ                          │
│   • Both lack Earth - ground yourselves                  │
│                                                          │
│   🎉 Party Summary:                                      │
│   "You two are like fire and wind - you make            │
│    each other more intense! Just don't burn             │
│    down the house."                                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 7. Current Cosmic Weather Mode

**Today's Transits**:
- Current planet positions
- Aspects to user's natal chart
- "Energy of the day" summary

**This Month Overview**:
- Major transits in effect
- Retrograde alerts
- Moon phases

**Display**:
```
┌─────────────────────────────────────────────────────────┐
│              TODAY: February 11, 2026                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🌙 Moon in Scorpio (emotional intensity)               │
│  ☿ Mercury in Aquarius (innovative thinking)            │
│  ♀ Venus in Pisces (romantic, dreamy)                   │
│                                                          │
│  HITTING YOUR CHART:                                     │
│  ├── Transit Jupiter trine your Sun                     │
│  │   → Expansion, luck, confidence boost                │
│  ├── Transit Saturn square your Moon                    │
│  │   → Emotional discipline needed                      │
│                                                          │
│  TODAY'S THEME: "Push through challenges for growth"    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 8. Social/Party Mode

**Purpose**: Fun, shareable, conversation-starting output

**Features**:
- One-liner summaries ("You're basically a Water Dragon with Leo flair")
- Meme-worthy comparisons
- Compatibility roasts (friendly)
- Shareable cards (generate image)

**Examples**:
```
🎉 PARTY MODE 🎉

Your Cosmic Cocktail:
"Two parts stubborn Taurus, one part chaotic Gemini rising,
shaken with a splash of emotional Cancer Moon.
Garnish with a Bazi Wood Dragon for that main character energy."

Your Superpower: Making everyone feel heard while secretly judging them.

Your Kryptonite: Anyone who rushes you before your second coffee.

Compatibility with Sarah:
"You two are the friend duo that either starts the party
or accidentally ends it. No in-between."
```

---

## UX Requirements

### Visual Design Principles

1. **Elegant, Not Mystical-Cliché**
   - Clean sans-serif typography
   - Subtle gradients, not starry backgrounds
   - Professional color palette with accent colors per element

2. **Color System**:
   ```
   Fire:  #E85D04 (warm orange)
   Earth: #606C38 (olive green)
   Air:   #90E0EF (sky blue)
   Water: #023E8A (deep blue)
   Metal: #6C757D (steel gray)
   Wood:  #2D6A4F (forest green)
   ```

3. **Interactive Elements**
   - Smooth hover transitions
   - Click feedback
   - Expandable panels (not cluttered)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Western | Bazi | Cross-Ref | Compatibility | ⚙️ │
├───────────────────────────────────────┬─────────────────────────┤
│                                       │                         │
│                                       │    DETAIL PANEL         │
│         MAIN VISUALIZATION            │    (Interpretations)    │
│         (Chart / Pillars)             │                         │
│                                       │    - Click element      │
│                                       │    - See explanation    │
│                                       │                         │
├───────────────────────────────────────┴─────────────────────────┤
│  BOTTOM BAR: Current Transit Summary | Party Mode Toggle        │
└─────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

- **Desktop**: Side-by-side chart + panel
- **Tablet**: Stacked with collapsible panel
- **Mobile**: Single column, tab-based navigation

---

*Document Version: 1.0*
*Phase: 2 - Feature Breakdown*
