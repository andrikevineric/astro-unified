# Astro Unified - Cross-Reference Logic

## PHASE 3: Cross-Reference & Scoring System

---

## Overview

The cross-reference system uses a **hybrid rule-based + LLM approach**:
1. **Rule Layer**: Deterministic mappings and calculations (always accurate)
2. **Synthesis Layer**: LLM enhancement for natural language (optional)

---

## Element Mapping System

### Western to Chinese Element Mapping

The four Western elements map to Chinese Five Elements with weighted affinities:

```
WESTERN ELEMENT    PRIMARY CHINESE    SECONDARY CHINESE
─────────────────────────────────────────────────────────
Fire               Fire (100%)        Wood (20%)*
Earth              Earth (100%)       —
Air                Metal (60%)        Wood (40%)**
Water              Water (100%)       —

* Fire signs have secondary Wood affinity (Wood feeds Fire)
** Air is intellectual (Metal) but also about ideas/growth (Wood)
```

### Zodiac Sign to Element Mapping

| Sign | Western Element | Chinese Affinity | Weight |
|------|-----------------|------------------|--------|
| Aries | Fire | Fire | 1.0 |
| Taurus | Earth | Earth | 1.0 |
| Gemini | Air | Metal + Wood | 0.6 + 0.4 |
| Cancer | Water | Water | 1.0 |
| Leo | Fire | Fire | 1.0 |
| Virgo | Earth | Earth | 1.0 |
| Libra | Air | Metal + Wood | 0.6 + 0.4 |
| Scorpio | Water | Water | 1.0 |
| Sagittarius | Fire | Fire + Wood | 0.8 + 0.2 |
| Capricorn | Earth | Earth | 1.0 |
| Aquarius | Air | Metal + Wood | 0.6 + 0.4 |
| Pisces | Water | Water | 1.0 |

### Planet Weights for Element Calculation

Not all planets contribute equally to elemental balance:

| Planet | Weight | Reason |
|--------|--------|--------|
| Sun | 3.0 | Core identity |
| Moon | 2.5 | Emotional nature |
| Ascendant | 2.0 | Outer expression |
| Mercury | 1.5 | Mind, communication |
| Venus | 1.5 | Values, love |
| Mars | 1.5 | Action, drive |
| Jupiter | 1.0 | Expansion |
| Saturn | 1.0 | Structure |
| Outer planets | 0.5 | Generational |

---

## Cross-Reference Scoring Algorithm

### Step 1: Calculate Western Element Profile

```javascript
function calculateWesternElements(chart) {
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  
  for (const planet of chart.planets) {
    const sign = planet.sign;
    const weight = PLANET_WEIGHTS[planet.name];
    const element = SIGN_ELEMENTS[sign];
    
    elements[element] += weight;
  }
  
  // Normalize to percentages
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  for (const el in elements) {
    elements[el] = (elements[el] / total) * 100;
  }
  
  return elements;
}

// Example output:
// { Fire: 35%, Earth: 20%, Air: 30%, Water: 15% }
```

### Step 2: Calculate Bazi Element Profile

```javascript
function calculateBaziElements(pillars) {
  const elements = { Wood: 0, Fire: 0, Earth: 0, Metal: 0, Water: 0 };
  
  // Heavenly Stems (天干) - weight 1.0
  for (const stem of pillars.stems) {
    elements[STEM_ELEMENTS[stem]] += 1.0;
  }
  
  // Earthly Branches (地支) - weight 1.0, plus hidden stems
  for (const branch of pillars.branches) {
    elements[BRANCH_ELEMENTS[branch].main] += 1.0;
    
    // Hidden stems within branches
    for (const hidden of BRANCH_ELEMENTS[branch].hidden) {
      elements[hidden.element] += hidden.weight;
    }
  }
  
  // Day Master gets bonus weight (core identity)
  elements[STEM_ELEMENTS[pillars.dayMaster]] += 1.0;
  
  // Normalize
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  for (const el in elements) {
    elements[el] = (elements[el] / total) * 100;
  }
  
  return elements;
}

// Example output:
// { Wood: 25%, Fire: 10%, Earth: 20%, Metal: 15%, Water: 30% }
```

### Step 3: Map Western to Chinese for Comparison

```javascript
function mapWesternToChinese(westernElements) {
  return {
    Wood: westernElements.Fire * 0.2 + westernElements.Air * 0.4,
    Fire: westernElements.Fire * 1.0,
    Earth: westernElements.Earth * 1.0,
    Metal: westernElements.Air * 0.6,
    Water: westernElements.Water * 1.0
  };
}
```

### Step 4: Calculate Cross-Reference Score

```javascript
function calculateCrossRefScore(westernMapped, baziElements) {
  const patterns = {
    reinforcing: [],
    balancing: [],
    conflicting: []
  };
  
  for (const element of ['Wood', 'Fire', 'Earth', 'Metal', 'Water']) {
    const western = westernMapped[element];
    const bazi = baziElements[element];
    const diff = Math.abs(western - bazi);
    
    if (western > 20 && bazi > 20) {
      // Both systems show this element strongly
      patterns.reinforcing.push({
        element,
        strength: Math.min(western, bazi),
        meaning: REINFORCING_MEANINGS[element]
      });
    } else if ((western > 20 && bazi < 10) || (bazi > 20 && western < 10)) {
      // One system compensates for other's lack
      patterns.balancing.push({
        element,
        source: western > bazi ? 'Western' : 'Bazi',
        meaning: BALANCING_MEANINGS[element]
      });
    } else if (diff > 30) {
      // Significant tension between systems
      patterns.conflicting.push({
        element,
        western,
        bazi,
        meaning: CONFLICTING_MEANINGS[element]
      });
    }
  }
  
  return patterns;
}
```

### Step 5: Generate Harmony Score

```javascript
function calculateHarmonyScore(patterns) {
  let score = 50; // Base score
  
  // Reinforcing patterns increase harmony
  score += patterns.reinforcing.length * 10;
  score += patterns.reinforcing.reduce((sum, p) => sum + p.strength * 0.2, 0);
  
  // Balancing patterns slightly positive (complementary)
  score += patterns.balancing.length * 5;
  
  // Conflicting patterns reduce harmony
  score -= patterns.conflicting.length * 8;
  
  return Math.max(0, Math.min(100, score));
}
```

---

## Compatibility Scoring System

### Western Synastry Scoring

```javascript
function calculateWesternCompatibility(chartA, chartB) {
  const scores = {
    emotional: 0,    // Sun-Moon contacts
    attraction: 0,   // Venus-Mars contacts
    communication: 0, // Mercury aspects
    longevity: 0     // Saturn aspects
  };
  
  // Sun-Moon (emotional bond)
  const sunMoonAspects = findAspects(chartA.sun, chartB.moon)
    .concat(findAspects(chartA.moon, chartB.sun));
  
  for (const aspect of sunMoonAspects) {
    scores.emotional += ASPECT_SCORES[aspect.type];
  }
  
  // Venus-Mars (attraction)
  const venusMarsAspects = findAspects(chartA.venus, chartB.mars)
    .concat(findAspects(chartA.mars, chartB.venus));
  
  for (const aspect of venusMarsAspects) {
    scores.attraction += ASPECT_SCORES[aspect.type];
  }
  
  // ... similar for communication and longevity
  
  // Normalize each to 0-100
  return normalizeScores(scores);
}

const ASPECT_SCORES = {
  conjunction: 25,
  trine: 20,
  sextile: 15,
  square: -10,  // Tension, but not always bad
  opposition: 5  // Attraction of opposites
};
```

### Bazi Compatibility Scoring

```javascript
function calculateBaziCompatibility(baziA, baziB) {
  const scores = {
    dayMasterHarmony: 0,
    branchCombinations: 0,
    elementComplement: 0
  };
  
  // Day Master relationship (productive cycle = good)
  const relationship = getDayMasterRelationship(
    baziA.dayMaster, 
    baziB.dayMaster
  );
  
  switch (relationship) {
    case 'produces':     scores.dayMasterHarmony = 90; break;
    case 'produced_by':  scores.dayMasterHarmony = 85; break;
    case 'same':         scores.dayMasterHarmony = 70; break;
    case 'controls':     scores.dayMasterHarmony = 40; break;
    case 'controlled_by': scores.dayMasterHarmony = 35; break;
  }
  
  // Branch combinations (六合, 三合)
  const combinations = findBranchCombinations(
    baziA.branches, 
    baziB.branches
  );
  
  scores.branchCombinations = 50 + combinations.liuHe * 20 + combinations.sanHe * 15;
  
  // Penalize clashes (六冲)
  scores.branchCombinations -= combinations.clashes * 25;
  
  // Element complementarity
  scores.elementComplement = calculateElementComplement(
    baziA.elements, 
    baziB.elements
  );
  
  return scores;
}

function calculateElementComplement(elementsA, elementsB) {
  // Does one person's strength fill the other's weakness?
  let complementScore = 50;
  
  for (const element of ['Wood', 'Fire', 'Earth', 'Metal', 'Water']) {
    if (elementsA[element] < 10 && elementsB[element] > 25) {
      complementScore += 10; // B fills A's gap
    }
    if (elementsB[element] < 10 && elementsA[element] > 25) {
      complementScore += 10; // A fills B's gap
    }
  }
  
  return Math.min(100, complementScore);
}
```

### Combined Compatibility Score

```javascript
function calculateOverallCompatibility(westernScores, baziScores, weights = { western: 0.5, bazi: 0.5 }) {
  const westernAvg = average(Object.values(westernScores));
  const baziAvg = average(Object.values(baziScores));
  
  return westernAvg * weights.western + baziAvg * weights.bazi;
}
```

---

## Transit Overlay System

### How Transits Modify Readings

```javascript
function applyTransitOverlay(natalReading, currentTransits) {
  const modifiedReading = { ...natalReading };
  
  for (const transit of currentTransits) {
    // Find which natal planet is aspected
    const natalPlanet = findAspectedNatal(transit, natalReading.chart);
    
    if (natalPlanet) {
      // Modify the interpretation
      const modification = {
        planet: transit.planet,
        aspect: transit.aspect,
        natalPlanet: natalPlanet.name,
        duration: transit.duration,
        intensity: calculateTransitIntensity(transit),
        theme: TRANSIT_THEMES[transit.planet][transit.aspect]
      };
      
      modifiedReading.activeTransits.push(modification);
      
      // Temporarily adjust element balance
      const transitElement = PLANET_ELEMENTS[transit.planet];
      modifiedReading.temporaryElementBoost[transitElement] += 
        modification.intensity * 0.1;
    }
  }
  
  return modifiedReading;
}

const TRANSIT_THEMES = {
  Jupiter: {
    conjunction: 'Expansion, luck, opportunity in this area',
    trine: 'Easy growth, blessings',
    square: 'Over-expansion, need for moderation',
    opposition: 'External opportunities challenging comfort zone'
  },
  Saturn: {
    conjunction: 'Restructuring, discipline required',
    trine: 'Steady progress, maturity',
    square: 'Obstacles, lessons, hard work',
    opposition: 'External pressure, reality checks'
  },
  // ... etc for other planets
};
```

---

## LLM Integration for Interpretation

### Prompt Template for Cross-Reference Synthesis

```javascript
const CROSS_REF_PROMPT = `
You are an astrology interpreter combining Western and Chinese traditions.

WESTERN CHART DATA:
- Sun: {sunSign} in {sunHouse}
- Moon: {moonSign} in {moonHouse}
- Rising: {rising}
- Dominant element: {dominantWestern}
- Key patterns: {patterns}

BAZI DATA:
- Day Master: {dayMaster} ({dayMasterElement})
- Element balance: {baziElements}
- Strong elements: {strongElements}
- Weak elements: {weakElements}

CROSS-REFERENCE FINDINGS:
- Reinforcing: {reinforcing}
- Balancing: {balancing}
- Conflicting: {conflicting}
- Harmony score: {harmonyScore}/100

TASK: Write a 2-paragraph synthesis that:
1. Explains how the Western and Chinese perspectives align
2. Highlights unique insights from combining both systems
3. Is specific to THIS person (not generic)
4. Uses accessible language (no jargon without explanation)

OUTPUT FORMAT: Plain text, conversational tone.
`;
```

### Prompt Template for Compatibility

```javascript
const COMPATIBILITY_PROMPT = `
Generate a fun, social-friendly compatibility summary.

PERSON A: {nameA}
- Western: {westernSummaryA}
- Bazi Day Master: {dayMasterA}

PERSON B: {nameB}
- Western: {westernSummaryB}
- Bazi Day Master: {dayMasterB}

SCORES:
- Overall: {overallScore}%
- Emotional: {emotionalScore}%
- Attraction: {attractionScore}%
- Communication: {commScore}%

STRENGTHS: {strengths}
CHALLENGES: {challenges}

TASK: Write a witty, party-friendly summary (3-4 sentences) that:
1. Captures their dynamic
2. Is fun and shareable
3. Includes one playful observation
4. Ends with lighthearted advice

TONE: Like a fun friend who knows astrology, not a fortune teller.
`;
```

---

## Fallback: Template-Based Interpretation

When LLM is unavailable, use pre-written templates:

```javascript
const TEMPLATES = {
  reinforcing: {
    Fire: "Both your Western and Chinese charts emphasize Fire energy. You're naturally passionate, creative, and drawn to leadership. This double Fire signature makes you a natural motivator.",
    Water: "Water dominates both your charts. You process the world through emotion and intuition. This deep Water nature gives you remarkable empathy and psychological insight.",
    // ... etc
  },
  
  balancing: {
    Western_compensates_Earth: "Your Western chart provides Earth energy that your Bazi lacks. While Chinese astrology shows you might struggle with practical matters, your Taurus/Virgo/Capricorn placements help ground you.",
    // ... etc
  },
  
  compatibility: {
    high: [
      "You two are cosmically compatible! Your energies flow together naturally.",
      "The stars smile on this pairing. You complement each other beautifully."
    ],
    medium: [
      "An interesting match with room to grow. Your differences can become strengths.",
      "You challenge each other in good ways. Expect growth through this connection."
    ],
    low: [
      "A challenging match that requires effort. But challenges build character!",
      "You're different, but opposites can attract. Communication is key."
    ]
  }
};
```

---

## Summary

| Component | Method | Accuracy | Flexibility |
|-----------|--------|----------|-------------|
| Element calculation | Rule-based | 100% | Low (fixed rules) |
| Cross-reference mapping | Rule-based | 100% | Medium (configurable weights) |
| Scoring | Rule-based | 100% | Medium (adjustable thresholds) |
| Interpretation text | LLM or Templates | Variable | High (contextual) |
| Party mode output | LLM or Templates | N/A | High (creative) |

The system ensures **calculations are always accurate** (rule-based) while **interpretations can be enhanced** by LLM when available.

---

*Document Version: 1.0*
*Phase: 3 - Cross-Reference Logic*
