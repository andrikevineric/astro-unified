/**
 * Western Astrology Calculations
 * Using Moshier Ephemeris for accurate planetary positions
 */

// @ts-ignore - ephemeris package doesn't have types
import ephemeris from 'ephemeris';

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

/**
 * Convert longitude to sign, degree, minutes
 */
function longitudeToPosition(longitude: number): { sign: string; degree: number; minutes: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degree) * 60);
  return { sign: SIGNS[signIndex], degree, minutes };
}

/**
 * Create planet position object
 */
function createPlanetPosition(name: string, longitude: number, retrograde: boolean = false): PlanetPosition {
  const pos = longitudeToPosition(longitude);
  return {
    name,
    longitude,
    sign: pos.sign,
    degree: pos.degree,
    minutes: pos.minutes,
    retrograde
  };
}

/**
 * Calculate Ascendant using sidereal time
 */
function calculateAscendant(date: Date, latitude: number, longitude: number): { sign: string; degree: number } {
  // Julian Day
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  let year = y, month = m;
  if (month <= 2) { year--; month += 12; }
  
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + d + h / 24 + B - 1524.5;
  
  const T = (JD - 2451545.0) / 36525;
  
  // Greenwich Mean Sidereal Time
  let GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  GMST = ((GMST % 360) + 360) % 360;
  
  // Local Sidereal Time
  const LST = ((GMST + longitude) % 360 + 360) % 360;
  const RAMC = LST * Math.PI / 180;
  
  // Obliquity of ecliptic
  const eps = (23.439291 - 0.0130042 * T) * Math.PI / 180;
  const phi = latitude * Math.PI / 180;
  
  // Calculate Ascendant
  const y_asc = -Math.cos(RAMC);
  const x_asc = Math.sin(RAMC) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = Math.atan2(y_asc, x_asc) * 180 / Math.PI;
  asc = ((asc % 360) + 360) % 360;
  
  const pos = longitudeToPosition(asc);
  return { sign: pos.sign, degree: pos.degree };
}

/**
 * Calculate aspects between planets
 */
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

/**
 * Detect chart patterns
 */
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
  
  // Grand Trine
  const trines = aspects.filter(a => a.type === 'Trine');
  if (trines.length >= 3) {
    const planetSet = new Set<string>();
    trines.forEach(t => { planetSet.add(t.planet1); planetSet.add(t.planet2); });
    if (planetSet.size >= 3) {
      // Check if they form a connected triangle
      const planetArr = Array.from(planetSet);
      for (let i = 0; i < planetArr.length - 2; i++) {
        for (let j = i + 1; j < planetArr.length - 1; j++) {
          for (let k = j + 1; k < planetArr.length; k++) {
            const p1 = planetArr[i], p2 = planetArr[j], p3 = planetArr[k];
            const hasT1 = trines.some(t => (t.planet1 === p1 && t.planet2 === p2) || (t.planet1 === p2 && t.planet2 === p1));
            const hasT2 = trines.some(t => (t.planet1 === p2 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p2));
            const hasT3 = trines.some(t => (t.planet1 === p1 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p1));
            if (hasT1 && hasT2 && hasT3) {
              const p1Sign = planets.find(p => p.name === p1)?.sign || '';
              const element = SIGN_ELEMENTS[p1Sign] || 'Fire';
              if (!patterns.some(p => p.includes('Grand Trine'))) {
                patterns.push(`Grand Trine (${element})`);
              }
            }
          }
        }
      }
    }
  }
  
  // T-Square: Opposition + 2 Squares to same planet
  const squares = aspects.filter(a => a.type === 'Square');
  const oppositions = aspects.filter(a => a.type === 'Opposition');
  
  for (const opp of oppositions) {
    const sq1 = squares.find(s => 
      (s.planet1 === opp.planet1 || s.planet2 === opp.planet1) &&
      (s.planet1 !== opp.planet2 && s.planet2 !== opp.planet2)
    );
    const sq2 = squares.find(s => 
      (s.planet1 === opp.planet2 || s.planet2 === opp.planet2) &&
      (s.planet1 !== opp.planet1 && s.planet2 !== opp.planet1)
    );
    
    if (sq1 && sq2) {
      const apex1 = sq1.planet1 === opp.planet1 ? sq1.planet2 : sq1.planet1;
      const apex2 = sq2.planet1 === opp.planet2 ? sq2.planet2 : sq2.planet1;
      if (apex1 === apex2 && !patterns.some(p => p.includes('T-Square'))) {
        patterns.push(`T-Square (apex: ${apex1})`);
      }
    }
  }
  
  // Yod: 2 Quincunxes + 1 Sextile
  const quincunxes = aspects.filter(a => a.type === 'Quincunx');
  const sextiles = aspects.filter(a => a.type === 'Sextile');
  
  for (const sext of sextiles) {
    const q1 = quincunxes.find(q => q.planet1 === sext.planet1 || q.planet2 === sext.planet1);
    const q2 = quincunxes.find(q => (q.planet1 === sext.planet2 || q.planet2 === sext.planet2) && q !== q1);
    
    if (q1 && q2) {
      const apex1 = q1.planet1 === sext.planet1 ? q1.planet2 : q1.planet1;
      const apex2 = q2.planet1 === sext.planet2 ? q2.planet2 : q2.planet1;
      if (apex1 === apex2 && !patterns.some(p => p.includes('Yod'))) {
        patterns.push(`Yod (apex: ${apex1})`);
      }
    }
  }
  
  return patterns;
}

/**
 * Calculate element distribution
 */
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

/**
 * Calculate full Western natal chart using Moshier ephemeris
 */
export function calculateWesternChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): WesternChart {
  // Get ephemeris data
  const result = ephemeris.getAllPlanets(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth() + 1,
    birthDate.getUTCDate(),
    birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60,
    latitude,
    longitude,
    0 // elevation
  );
  
  // Extract planet positions from ephemeris result
  const sun = createPlanetPosition('Sun', result.observed.sun.apparentLongitudeDd);
  const moon = createPlanetPosition('Moon', result.observed.moon.apparentLongitudeDd);
  const mercury = createPlanetPosition('Mercury', result.observed.mercury.apparentLongitudeDd);
  const venus = createPlanetPosition('Venus', result.observed.venus.apparentLongitudeDd);
  const mars = createPlanetPosition('Mars', result.observed.mars.apparentLongitudeDd);
  const jupiter = createPlanetPosition('Jupiter', result.observed.jupiter.apparentLongitudeDd);
  const saturn = createPlanetPosition('Saturn', result.observed.saturn.apparentLongitudeDd);
  const uranus = createPlanetPosition('Uranus', result.observed.uranus.apparentLongitudeDd);
  const neptune = createPlanetPosition('Neptune', result.observed.neptune.apparentLongitudeDd);
  const pluto = createPlanetPosition('Pluto', result.observed.pluto.apparentLongitudeDd);
  
  const planets = [sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto];
  
  // Calculate Ascendant
  const rising = calculateAscendant(birthDate, latitude, longitude);
  
  // Calculate aspects
  const aspects = calculateAspects(planets);
  
  // Calculate elements
  const elements = calculateElements(planets);
  
  // Detect patterns
  const patterns = detectPatterns(planets, aspects);
  
  return {
    sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto,
    rising,
    aspects,
    elements,
    patterns
  };
}
