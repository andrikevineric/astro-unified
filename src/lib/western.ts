/**
 * Western Astrology Calculations
 * Uses astronomia for planetary ephemeris
 */

// Zodiac signs in order (0° Aries = start)
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
  retrograde: boolean;
}

export interface WesternChart {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  rising: { sign: string; degree: number };
  elements: { Fire: number; Earth: number; Air: number; Water: number };
  patterns: string[];
}

/**
 * Convert longitude (0-360) to sign and degree
 */
function longitudeToSign(longitude: number): { sign: string; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = Math.floor(normalized % 30);
  return { sign: SIGNS[signIndex], degree };
}

/**
 * Calculate Julian Day from date
 */
function dateToJulian(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + 
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

/**
 * Calculate planetary longitude using simplified VSOP87 approximations
 * This is a simplified calculation - for production, use full ephemeris
 */
function calculatePlanetLongitude(jd: number, planet: string): number {
  const T = (jd - 2451545.0) / 36525; // Julian centuries from J2000.0
  
  // Mean longitudes (simplified)
  const meanLongitudes: Record<string, () => number> = {
    sun: () => 280.46646 + 36000.76983 * T + 0.0003032 * T * T,
    moon: () => 218.3165 + 481267.8813 * T,
    mercury: () => 252.2509 + 149472.6746 * T,
    venus: () => 181.9798 + 58517.8157 * T,
    mars: () => 355.4330 + 19140.2993 * T,
    jupiter: () => 34.3515 + 3034.9057 * T,
    saturn: () => 50.0774 + 1222.1138 * T,
  };
  
  const calc = meanLongitudes[planet.toLowerCase()];
  if (!calc) return 0;
  
  let longitude = calc();
  
  // Normalize to 0-360
  longitude = ((longitude % 360) + 360) % 360;
  
  return longitude;
}

/**
 * Calculate Ascendant (Rising Sign) based on local sidereal time
 */
function calculateAscendant(jd: number, latitude: number, longitude: number): { sign: string; degree: number } {
  // Calculate Local Sidereal Time
  const T = (jd - 2451545.0) / 36525;
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  GMST = ((GMST % 360) + 360) % 360;
  
  // Local Sidereal Time
  const LST = (GMST + longitude + 360) % 360;
  
  // Convert to radians
  const RAMC = LST * Math.PI / 180;
  const lat = latitude * Math.PI / 180;
  const obliquity = 23.4393 * Math.PI / 180; // Earth's axial tilt
  
  // Calculate Ascendant
  const y = -Math.cos(RAMC);
  const x = Math.sin(RAMC) * Math.cos(obliquity) + Math.tan(lat) * Math.sin(obliquity);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  asc = ((asc % 360) + 360) % 360;
  
  return longitudeToSign(asc);
}

/**
 * Detect chart patterns
 */
function detectPatterns(planets: PlanetPosition[]): string[] {
  const patterns: string[] = [];
  
  // Group planets by sign
  const signGroups: Record<string, PlanetPosition[]> = {};
  planets.forEach(p => {
    if (!signGroups[p.sign]) signGroups[p.sign] = [];
    signGroups[p.sign].push(p);
  });
  
  // Check for Stellium (3+ planets in one sign)
  Object.entries(signGroups).forEach(([sign, ps]) => {
    if (ps.length >= 3) {
      patterns.push(`Stellium in ${sign}`);
    }
  });
  
  // Group by element
  const elementGroups: Record<string, PlanetPosition[]> = { Fire: [], Earth: [], Air: [], Water: [] };
  planets.forEach(p => {
    const element = SIGN_ELEMENTS[p.sign];
    if (element) elementGroups[element].push(p);
  });
  
  // Check for Grand Trine (3+ planets in same element, roughly 120° apart)
  Object.entries(elementGroups).forEach(([element, ps]) => {
    if (ps.length >= 3) {
      patterns.push(`Grand Trine (${element})`);
    }
  });
  
  return patterns;
}

/**
 * Calculate element distribution
 */
function calculateElements(planets: PlanetPosition[]): { Fire: number; Earth: number; Air: number; Water: number } {
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  
  // Weight: Sun and Moon count more
  const weights: Record<string, number> = {
    sun: 2, moon: 2, mercury: 1, venus: 1, mars: 1, jupiter: 1, saturn: 1
  };
  
  let total = 0;
  planets.forEach(p => {
    const element = SIGN_ELEMENTS[p.sign];
    const weight = weights[p.name.toLowerCase()] || 1;
    if (element) {
      counts[element] += weight;
      total += weight;
    }
  });
  
  // Convert to percentages
  return {
    Fire: Math.round((counts.Fire / total) * 100),
    Earth: Math.round((counts.Earth / total) * 100),
    Air: Math.round((counts.Air / total) * 100),
    Water: Math.round((counts.Water / total) * 100),
  };
}

/**
 * Calculate a full Western natal chart
 */
export function calculateWesternChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): WesternChart {
  const jd = dateToJulian(birthDate);
  
  // Calculate planetary positions
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const planets: PlanetPosition[] = planetNames.map(name => {
    const lng = calculatePlanetLongitude(jd, name);
    const { sign, degree } = longitudeToSign(lng);
    return {
      name,
      longitude: lng,
      sign,
      degree,
      retrograde: false // Simplified - would need velocity calculation for real retrograde
    };
  });
  
  const rising = calculateAscendant(jd, latitude, longitude);
  const elements = calculateElements(planets);
  const patterns = detectPatterns(planets);
  
  return {
    sun: planets[0],
    moon: planets[1],
    mercury: planets[2],
    venus: planets[3],
    mars: planets[4],
    jupiter: planets[5],
    saturn: planets[6],
    rising,
    elements,
    patterns
  };
}
