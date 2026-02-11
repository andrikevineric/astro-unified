/**
 * Western Astrology Calculations
 * Pure JavaScript implementation using Keplerian orbital elements
 * Accuracy: typically within 1-2° for most planets
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
// Constants and helpers
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
// Keplerian orbital elements (J2000.0 + rates)
// ============================================

interface OrbitalElements {
  a: number;   // semi-major axis (AU)
  e: number;   // eccentricity
  I: number;   // inclination (deg)
  L: number;   // mean longitude (deg)
  w: number;   // longitude of perihelion (deg)
  O: number;   // longitude of ascending node (deg)
  aR: number;  // rate of a
  eR: number;  // rate of e
  IR: number;  // rate of I
  LR: number;  // rate of L
  wR: number;  // rate of w
  OR: number;  // rate of O
}

const ORBITAL_ELEMENTS: Record<string, OrbitalElements> = {
  Mercury: { a: 0.387098, e: 0.205635, I: 7.005, L: 252.2509, w: 77.4561, O: 48.3309,
             aR: 0, eR: 0.00002123, IR: -0.0059, LR: 149472.6746, wR: 0.1588, OR: -0.1254 },
  Venus:   { a: 0.723332, e: 0.006772, I: 3.3947, L: 181.9798, w: 131.5637, O: 76.6807,
             aR: 0, eR: -0.00004938, IR: -0.0078, LR: 58517.8157, wR: 0.0048, OR: -0.2780 },
  Earth:   { a: 1.000001, e: 0.016709, I: 0, L: 100.4665, w: 102.9373, O: 0,
             aR: 0, eR: -0.00004204, IR: 0, LR: 35999.3720, wR: 0.3225, OR: 0 },
  Mars:    { a: 1.523679, e: 0.093394, I: 1.8497, L: 355.4533, w: 336.0602, O: 49.5574,
             aR: 0, eR: 0.00007882, IR: -0.0081, LR: 19140.2993, wR: 0.4439, OR: -0.2949 },
  Jupiter: { a: 5.202887, e: 0.048386, I: 1.3033, L: 34.3515, w: 14.7539, O: 100.4644,
             aR: -0.00011607, eR: -0.00013253, IR: -0.00183, LR: 3034.9057, wR: 0.2184, OR: 0.1768 },
  Saturn:  { a: 9.536676, e: 0.053862, I: 2.4889, L: 50.0774, w: 92.5988, O: 113.6634,
             aR: 0.00025899, eR: -0.00050991, IR: 0.00193, LR: 1222.1138, wR: -0.1897, OR: -0.2524 },
  Uranus:  { a: 19.18916, e: 0.047257, I: 0.7732, L: 314.0550, w: 170.9543, O: 74.0060,
             aR: -0.00196176, eR: -0.00004397, IR: -0.00242, LR: 428.4669, wR: 0.4024, OR: 0.0465 },
  Neptune: { a: 30.06992, e: 0.008590, I: 1.7700, L: 304.3487, w: 44.9648, O: 131.7841,
             aR: 0.00026291, eR: 0.00005105, IR: 0.00035, LR: 218.4862, wR: -0.3240, OR: -0.0060 },
  Pluto:   { a: 39.48212, e: 0.248808, I: 17.1420, L: 238.9283, w: 224.0675, O: 110.3034,
             aR: -0.00031596, eR: 0.00006465, IR: 0.00040, LR: 145.2078, wR: -0.0096, OR: -0.0107 }
};

// ============================================
// Kepler equation solver
// ============================================

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 15; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

// ============================================
// Heliocentric position calculation
// ============================================

function calcHeliocentricPosition(planet: string, T: number): { r: number; longitude: number } {
  const p = ORBITAL_ELEMENTS[planet];
  
  const a = p.a + p.aR * T;
  const e = p.e + p.eR * T;
  const L = normalizeAngle(p.L + p.LR * T);
  const w = normalizeAngle(p.w + p.wR * T);
  
  // Mean anomaly
  const M = normalizeAngle(L - w) * DEG_TO_RAD;
  
  // Solve Kepler equation
  const E = solveKepler(M, e);
  
  // True anomaly
  const v = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  
  // Heliocentric distance
  const r = a * (1 - e * Math.cos(E));
  
  // Heliocentric longitude (in the orbital plane)
  const longitude = normalizeAngle(v * RAD_TO_DEG + w);
  
  return { r, longitude };
}

// ============================================
// Geocentric longitude calculation
// ============================================

function calcGeocentricLongitude(planet: string, T: number): number {
  const pHelio = calcHeliocentricPosition(planet, T);
  const earthHelio = calcHeliocentricPosition('Earth', T);
  
  // Convert to rectangular heliocentric coordinates (ecliptic plane)
  const pRad = pHelio.longitude * DEG_TO_RAD;
  const eRad = earthHelio.longitude * DEG_TO_RAD;
  
  const px = pHelio.r * Math.cos(pRad);
  const py = pHelio.r * Math.sin(pRad);
  const ex = earthHelio.r * Math.cos(eRad);
  const ey = earthHelio.r * Math.sin(eRad);
  
  // Geocentric rectangular coordinates
  const gx = px - ex;
  const gy = py - ey;
  
  // Geocentric ecliptic longitude
  return normalizeAngle(Math.atan2(gy, gx) * RAD_TO_DEG);
}

// ============================================
// Sun position (geocentric = opposite of Earth heliocentric)
// ============================================

function calcSunLongitude(T: number): number {
  // Use high-precision Meeus formula for Sun
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mrad = M * DEG_TO_RAD;
  
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
  
  return normalizeAngle(L0 + C);
}

// ============================================
// Moon position (simplified lunar theory)
// ============================================

function calcMoonLongitude(T: number): number {
  // Mean elements
  const Lp = 218.3164477 + 481267.88123421 * T 
           - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
  const D = 297.8501921 + 445267.1114034 * T 
          - 0.0018819 * T * T + T * T * T / 545868;
  const M = 357.5291092 + 35999.0502909 * T 
          - 0.0001536 * T * T;
  const Mp = 134.9633964 + 477198.8675055 * T 
           + 0.0087414 * T * T + T * T * T / 69699;
  const F = 93.2720950 + 483202.0175233 * T 
          - 0.0036539 * T * T;
  
  const Drad = D * DEG_TO_RAD;
  const Mrad = M * DEG_TO_RAD;
  const Mprad = Mp * DEG_TO_RAD;
  const Frad = F * DEG_TO_RAD;
  
  // Longitude corrections (main terms from ELP2000)
  let longitude = Lp
    + 6.288774 * Math.sin(Mprad)
    + 1.274027 * Math.sin(2 * Drad - Mprad)
    + 0.658314 * Math.sin(2 * Drad)
    + 0.213618 * Math.sin(2 * Mprad)
    - 0.185116 * Math.sin(Mrad)
    - 0.114332 * Math.sin(2 * Frad)
    + 0.058793 * Math.sin(2 * Drad - 2 * Mprad)
    + 0.057066 * Math.sin(2 * Drad - Mrad - Mprad)
    + 0.053322 * Math.sin(2 * Drad + Mprad)
    + 0.045758 * Math.sin(2 * Drad - Mrad)
    - 0.040923 * Math.sin(Mrad - Mprad)
    - 0.034720 * Math.sin(Drad)
    - 0.030383 * Math.sin(Mrad + Mprad)
    + 0.015327 * Math.sin(2 * Drad - 2 * Frad)
    - 0.012528 * Math.sin(Mprad + 2 * Frad)
    + 0.010980 * Math.sin(Mprad - 2 * Frad);
  
  return normalizeAngle(longitude);
}

// ============================================
// Retrograde detection
// ============================================

function isRetrograde(planet: string, T: number): boolean {
  const dt = 0.0001; // ~3.6 hours
  const pos1 = calcGeocentricLongitude(planet, T - dt);
  const pos2 = calcGeocentricLongitude(planet, T + dt);
  
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
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) 
           + 0.000387933 * T * T - T * T * T / 38710000;
  GMST = normalizeAngle(GMST);
  
  // Local Sidereal Time
  const LST = normalizeAngle(GMST + longitude);
  const RAMC = LST * DEG_TO_RAD;
  
  // Obliquity of ecliptic
  const eps = (23.439291 - 0.0130042 * T - 0.00000016 * T * T) * DEG_TO_RAD;
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
          break; // Only one aspect per planet pair
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
    const planetArr = Array.from(planetSet);
    
    outer: for (let i = 0; i < planetArr.length - 2; i++) {
      for (let j = i + 1; j < planetArr.length - 1; j++) {
        for (let k = j + 1; k < planetArr.length; k++) {
          const [p1, p2, p3] = [planetArr[i], planetArr[j], planetArr[k]];
          const hasT1 = trines.some(t => 
            (t.planet1 === p1 && t.planet2 === p2) || (t.planet1 === p2 && t.planet2 === p1));
          const hasT2 = trines.some(t => 
            (t.planet1 === p2 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p2));
          const hasT3 = trines.some(t => 
            (t.planet1 === p1 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p1));
          
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
  
  // T-Square: Opposition + 2 Squares to same planet
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
  
  if (total === 0) return { Fire: 25, Earth: 25, Air: 25, Water: 25 };
  
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
  const mercuryLong = calcGeocentricLongitude('Mercury', T);
  const venusLong = calcGeocentricLongitude('Venus', T);
  const marsLong = calcGeocentricLongitude('Mars', T);
  const jupiterLong = calcGeocentricLongitude('Jupiter', T);
  const saturnLong = calcGeocentricLongitude('Saturn', T);
  const uranusLong = calcGeocentricLongitude('Uranus', T);
  const neptuneLong = calcGeocentricLongitude('Neptune', T);
  const plutoLong = calcGeocentricLongitude('Pluto', T);
  
  const sun = createPlanetPosition('Sun', sunLong, false);
  const moon = createPlanetPosition('Moon', moonLong, false);
  const mercury = createPlanetPosition('Mercury', mercuryLong, isRetrograde('Mercury', T));
  const venus = createPlanetPosition('Venus', venusLong, isRetrograde('Venus', T));
  const mars = createPlanetPosition('Mars', marsLong, isRetrograde('Mars', T));
  const jupiter = createPlanetPosition('Jupiter', jupiterLong, isRetrograde('Jupiter', T));
  const saturn = createPlanetPosition('Saturn', saturnLong, isRetrograde('Saturn', T));
  const uranus = createPlanetPosition('Uranus', uranusLong, isRetrograde('Uranus', T));
  const neptune = createPlanetPosition('Neptune', neptuneLong, isRetrograde('Neptune', T));
  const pluto = createPlanetPosition('Pluto', plutoLong, isRetrograde('Pluto', T));
  
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
