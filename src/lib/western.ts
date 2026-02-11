/**
 * Western Astrology Calculations
 * Pure JavaScript implementation - no external dependencies
 * Uses simplified VSOP87 and lunar theory approximations
 */

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

const SIGN_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
};

export interface PlanetPosition {
  name: string;
  longitude: number;
  sign: string;
  degree: number;
  minutes: number;
  retrograde: boolean;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
}

export interface WesternChart {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  rising: { sign: string; degree: number };
  aspects: Aspect[];
  elements: { Fire: number; Earth: number; Air: number; Water: number };
  patterns: string[];
}

// ============================================
// Astronomical calculation helpers
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function julianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  let year = y, month = m;
  if (month <= 2) { year--; month += 12; }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + h / 24 + B - 1524.5;
}

function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

// ============================================
// Planetary position calculations (simplified VSOP87)
// ============================================

function calcSunLongitude(T: number): number {
  // Mean longitude
  const L0 = 280.4664567 + 360007.6982779 * T + 0.03032028 * T * T;
  // Mean anomaly
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T;
  const Mrad = M * DEG_TO_RAD;
  // Equation of center
  const C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.00029 * Math.sin(3 * Mrad);
  
  return normalizeAngle(L0 + C);
}

function calcMoonLongitude(T: number): number {
  // Simplified lunar theory
  const Lp = 218.3164477 + 481267.88123421 * T;  // Mean longitude
  const D = 297.8501921 + 445267.1114034 * T;    // Mean elongation
  const M = 357.5291092 + 35999.0502909 * T;     // Sun's mean anomaly
  const Mp = 134.9633964 + 477198.8675055 * T;   // Moon's mean anomaly
  const F = 93.2720950 + 483202.0175233 * T;     // Moon's argument of latitude
  
  const Drad = D * DEG_TO_RAD;
  const Mrad = M * DEG_TO_RAD;
  const Mprad = Mp * DEG_TO_RAD;
  const Frad = F * DEG_TO_RAD;
  
  // Main periodic terms
  let longitude = Lp
    + 6.289 * Math.sin(Mprad)
    - 1.274 * Math.sin(2 * Drad - Mprad)
    + 0.658 * Math.sin(2 * Drad)
    - 0.214 * Math.sin(2 * Mprad)
    - 0.186 * Math.sin(Mrad)
    - 0.114 * Math.sin(2 * Frad);
  
  return normalizeAngle(longitude);
}

function calcMercuryLongitude(T: number): number {
  const L = 252.2509 + 149472.6746 * T;
  const M = 174.7947 + 149472.5153 * T;
  const Mrad = M * DEG_TO_RAD;
  const sunL = calcSunLongitude(T);
  
  // Heliocentric to geocentric approximation
  const C = 23.44 * Math.sin(Mrad) + 2.9 * Math.sin(2 * Mrad);
  let longitude = L + C;
  
  // Simplified geocentric correction
  const elongation = normalizeAngle(longitude - sunL);
  if (elongation > 180) {
    longitude += (360 - elongation) * 0.1;
  } else {
    longitude -= elongation * 0.1;
  }
  
  return normalizeAngle(longitude);
}

function calcVenusLongitude(T: number): number {
  const L = 181.9798 + 58517.8157 * T;
  const M = 50.4161 + 58517.8039 * T;
  const Mrad = M * DEG_TO_RAD;
  const sunL = calcSunLongitude(T);
  
  const C = 0.7758 * Math.sin(Mrad) + 0.0033 * Math.sin(2 * Mrad);
  let longitude = L + C;
  
  // Geocentric correction
  const elongation = normalizeAngle(longitude - sunL);
  if (elongation > 180) {
    longitude += (360 - elongation) * 0.05;
  } else {
    longitude -= elongation * 0.05;
  }
  
  return normalizeAngle(longitude);
}

function calcMarsLongitude(T: number): number {
  const L = 355.4330 + 19140.2993 * T;
  const M = 19.3730 + 19139.8585 * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = 10.6912 * Math.sin(Mrad) + 0.6228 * Math.sin(2 * Mrad) + 0.0503 * Math.sin(3 * Mrad);
  
  return normalizeAngle(L + C);
}

function calcJupiterLongitude(T: number): number {
  const L = 34.3515 + 3034.9057 * T;
  const M = 20.0202 + 3034.6962 * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = 5.5549 * Math.sin(Mrad) + 0.1683 * Math.sin(2 * Mrad);
  
  return normalizeAngle(L + C);
}

function calcSaturnLongitude(T: number): number {
  const L = 50.0774 + 1222.1139 * T;
  const M = 317.0207 + 1222.1138 * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = 6.4040 * Math.sin(Mrad) + 0.2235 * Math.sin(2 * Mrad);
  
  return normalizeAngle(L + C);
}

function calcUranusLongitude(T: number): number {
  const L = 314.0550 + 428.4669 * T;
  const M = 141.0498 + 428.4670 * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = 5.3118 * Math.sin(Mrad) + 0.1484 * Math.sin(2 * Mrad);
  
  return normalizeAngle(L + C);
}

function calcNeptuneLongitude(T: number): number {
  const L = 304.3487 + 218.4862 * T;
  const M = 256.2250 + 218.4862 * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = 0.9680 * Math.sin(Mrad);
  
  return normalizeAngle(L + C);
}

function calcPlutoLongitude(T: number): number {
  // Pluto has a very elliptical orbit; simplified
  const L = 238.9283 + 145.1781 * T;
  const M = 14.8820 + 145.1739 * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = 28.32 * Math.sin(Mrad) + 4.64 * Math.sin(2 * Mrad);
  
  return normalizeAngle(L + C);
}

// Retrograde detection (simplified: compare positions)
function isRetrograde(calcFn: (T: number) => number, T: number): boolean {
  const pos1 = calcFn(T - 0.0001);
  const pos2 = calcFn(T + 0.0001);
  let diff = pos2 - pos1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

// ============================================
// Chart helpers
// ============================================

function longitudeToPosition(longitude: number): { sign: string; degree: number; minutes: number } {
  const normalized = normalizeAngle(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degree) * 60);
  return { sign: SIGNS[signIndex], degree, minutes };
}

function createPlanetPosition(name: string, longitude: number, retrograde: boolean = false): PlanetPosition {
  const pos = longitudeToPosition(longitude);
  return {
    name,
    longitude: Math.round(longitude * 100) / 100,
    sign: pos.sign,
    degree: pos.degree,
    minutes: pos.minutes,
    retrograde
  };
}

function calculateAscendant(date: Date, latitude: number, longitude: number): { sign: string; degree: number } {
  const JD = julianDay(date);
  const T = julianCenturies(JD);
  
  // Greenwich Mean Sidereal Time
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T;
  GMST = normalizeAngle(GMST);
  
  // Local Sidereal Time
  const LST = normalizeAngle(GMST + longitude);
  const RAMC = LST * DEG_TO_RAD;
  
  // Obliquity of ecliptic
  const eps = (23.439291 - 0.0130042 * T) * DEG_TO_RAD;
  const phi = latitude * DEG_TO_RAD;
  
  // Calculate Ascendant
  const y_asc = -Math.cos(RAMC);
  const x_asc = Math.sin(RAMC) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = Math.atan2(y_asc, x_asc) * RAD_TO_DEG;
  asc = normalizeAngle(asc);
  
  const pos = longitudeToPosition(asc);
  return { sign: pos.sign, degree: pos.degree };
}

function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectDefs = [
    { name: 'Conjunction', angle: 0, orb: 8 },
    { name: 'Opposition', angle: 180, orb: 8 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Square', angle: 90, orb: 7 },
    { name: 'Sextile', angle: 60, orb: 6 },
    { name: 'Quincunx', angle: 150, orb: 3 },
  ];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const def of aspectDefs) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: def.name,
            angle: def.angle,
            orb: Math.round(orb * 10) / 10
          });
        }
      }
    }
  }
  
  return aspects;
}

function detectPatterns(planets: PlanetPosition[], aspects: Aspect[]): string[] {
  const patterns: string[] = [];
  
  // Stellium: 3+ planets in one sign
  const signCounts: Record<string, PlanetPosition[]> = {};
  planets.forEach(p => {
    if (!signCounts[p.sign]) signCounts[p.sign] = [];
    signCounts[p.sign].push(p);
  });
  
  Object.entries(signCounts).forEach(([sign, ps]) => {
    if (ps.length >= 3) {
      patterns.push(`Stellium in ${sign} (${ps.map(p => p.name).join(', ')})`);
    }
  });
  
  // Grand Trine detection
  const trines = aspects.filter(a => a.type === 'Trine');
  if (trines.length >= 3) {
    const planetSet = new Set<string>();
    trines.forEach(t => { planetSet.add(t.planet1); planetSet.add(t.planet2); });
    if (planetSet.size >= 3) {
      const planetArr = Array.from(planetSet);
      outer: for (let i = 0; i < planetArr.length - 2; i++) {
        for (let j = i + 1; j < planetArr.length - 1; j++) {
          for (let k = j + 1; k < planetArr.length; k++) {
            const p1 = planetArr[i], p2 = planetArr[j], p3 = planetArr[k];
            const hasT1 = trines.some(t => (t.planet1 === p1 && t.planet2 === p2) || (t.planet1 === p2 && t.planet2 === p1));
            const hasT2 = trines.some(t => (t.planet1 === p2 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p2));
            const hasT3 = trines.some(t => (t.planet1 === p1 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p1));
            if (hasT1 && hasT2 && hasT3) {
              const p1Sign = planets.find(p => p.name === p1)?.sign || '';
              const element = SIGN_ELEMENTS[p1Sign] || 'Fire';
              patterns.push(`Grand Trine (${element})`);
              break outer;
            }
          }
        }
      }
    }
  }
  
  // T-Square detection
  const squares = aspects.filter(a => a.type === 'Square');
  const oppositions = aspects.filter(a => a.type === 'Opposition');
  
  for (const opp of oppositions) {
    for (const planet of planets) {
      if (planet.name === opp.planet1 || planet.name === opp.planet2) continue;
      
      const sq1 = squares.find(s => 
        (s.planet1 === opp.planet1 && s.planet2 === planet.name) ||
        (s.planet2 === opp.planet1 && s.planet1 === planet.name)
      );
      const sq2 = squares.find(s => 
        (s.planet1 === opp.planet2 && s.planet2 === planet.name) ||
        (s.planet2 === opp.planet2 && s.planet1 === planet.name)
      );
      
      if (sq1 && sq2 && !patterns.some(p => p.includes('T-Square'))) {
        patterns.push(`T-Square (apex: ${planet.name})`);
        break;
      }
    }
  }
  
  return patterns;
}

function calculateElements(planets: PlanetPosition[]): { Fire: number; Earth: number; Air: number; Water: number } {
  const weights: Record<string, number> = {
    Sun: 2, Moon: 2, Mercury: 1, Venus: 1, Mars: 1,
    Jupiter: 1, Saturn: 1, Uranus: 0.5, Neptune: 0.5, Pluto: 0.5
  };
  
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  let total = 0;
  
  planets.forEach(p => {
    const element = SIGN_ELEMENTS[p.sign];
    const weight = weights[p.name] || 1;
    if (element) {
      counts[element] += weight;
      total += weight;
    }
  });
  
  return {
    Fire: Math.round((counts.Fire / total) * 100),
    Earth: Math.round((counts.Earth / total) * 100),
    Air: Math.round((counts.Air / total) * 100),
    Water: Math.round((counts.Water / total) * 100),
  };
}

// ============================================
// Main export
// ============================================

export function calculateWesternChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): WesternChart {
  const JD = julianDay(birthDate);
  const T = julianCenturies(JD);
  
  // Calculate all planet positions
  const sunLong = calcSunLongitude(T);
  const moonLong = calcMoonLongitude(T);
  const mercuryLong = calcMercuryLongitude(T);
  const venusLong = calcVenusLongitude(T);
  const marsLong = calcMarsLongitude(T);
  const jupiterLong = calcJupiterLongitude(T);
  const saturnLong = calcSaturnLongitude(T);
  const uranusLong = calcUranusLongitude(T);
  const neptuneLong = calcNeptuneLongitude(T);
  const plutoLong = calcPlutoLongitude(T);
  
  const sun = createPlanetPosition('Sun', sunLong, false);
  const moon = createPlanetPosition('Moon', moonLong, false);
  const mercury = createPlanetPosition('Mercury', mercuryLong, isRetrograde(calcMercuryLongitude, T));
  const venus = createPlanetPosition('Venus', venusLong, isRetrograde(calcVenusLongitude, T));
  const mars = createPlanetPosition('Mars', marsLong, isRetrograde(calcMarsLongitude, T));
  const jupiter = createPlanetPosition('Jupiter', jupiterLong, isRetrograde(calcJupiterLongitude, T));
  const saturn = createPlanetPosition('Saturn', saturnLong, isRetrograde(calcSaturnLongitude, T));
  const uranus = createPlanetPosition('Uranus', uranusLong, isRetrograde(calcUranusLongitude, T));
  const neptune = createPlanetPosition('Neptune', neptuneLong, isRetrograde(calcNeptuneLongitude, T));
  const pluto = createPlanetPosition('Pluto', plutoLong, isRetrograde(calcPlutoLongitude, T));
  
  const planets = [sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto];
  
  const rising = calculateAscendant(birthDate, latitude, longitude);
  const aspects = calculateAspects(planets);
  const elements = calculateElements(planets);
  const patterns = detectPatterns(planets, aspects);
  
  return {
    sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto,
    rising,
    aspects,
    elements,
    patterns
  };
}
