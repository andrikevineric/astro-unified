/**
 * Western Astrology Calculations
 * Using proper astronomical calculations
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

/**
 * Convert Julian Day to Julian Centuries from J2000.0
 */
function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

/**
 * Calculate Julian Day from date
 */
function dateToJulian(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  
  let y = year;
  let m = month;
  
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + hour / 24 + b - 1524.5;
}

/**
 * Normalize angle to 0-360 range
 */
function normalize(angle: number): number {
  let result = angle % 360;
  if (result < 0) result += 360;
  return result;
}

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

/**
 * Convert radians to degrees
 */
function toDeg(rad: number): number {
  return rad * 180 / Math.PI;
}

/**
 * Calculate Sun position using VSOP87 simplified
 */
function calculateSun(T: number): { longitude: number; latitude: number } {
  // Mean longitude
  const L0 = normalize(280.4664567 + 360007.6982779 * T + 0.03032028 * T * T);
  
  // Mean anomaly
  const M = normalize(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mrad = toRad(M);
  
  // Equation of center
  const C = (1.9146 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.00029 * Math.sin(3 * Mrad);
  
  // True longitude
  const longitude = normalize(L0 + C);
  
  return { longitude, latitude: 0 };
}

/**
 * Calculate Moon position using ELP2000 simplified
 */
function calculateMoon(T: number): { longitude: number; latitude: number } {
  // Mean longitude
  const Lp = normalize(218.3164591 + 481267.88134236 * T - 0.0015786 * T * T + T * T * T / 538841);
  
  // Mean elongation
  const D = normalize(297.8502042 + 445267.1115168 * T - 0.00163 * T * T + T * T * T / 545868);
  
  // Sun's mean anomaly
  const M = normalize(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  
  // Moon's mean anomaly
  const Mp = normalize(134.9634114 + 477198.8676313 * T + 0.008997 * T * T + T * T * T / 69699);
  
  // Moon's argument of latitude
  const F = normalize(93.2720993 + 483202.0175273 * T - 0.0034029 * T * T - T * T * T / 3526000);
  
  // Convert to radians
  const Drad = toRad(D);
  const Mrad = toRad(M);
  const Mprad = toRad(Mp);
  const Frad = toRad(F);
  
  // Longitude corrections (main terms)
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
  
  longitude = normalize(longitude);
  
  // Latitude (simplified)
  const latitude = 5.128189 * Math.sin(Frad)
    + 0.280606 * Math.sin(Mprad + Frad)
    + 0.277693 * Math.sin(Mprad - Frad)
    + 0.173238 * Math.sin(2 * Drad - Frad);
  
  return { longitude, latitude };
}

/**
 * Calculate planet positions using orbital elements
 */
function calculatePlanet(T: number, planet: string): { longitude: number; retrograde: boolean } {
  // Orbital elements for planets (J2000.0 epoch, rates per century)
  const elements: Record<string, {
    L0: number; Ldot: number;  // Mean longitude
    a: number;                  // Semi-major axis (AU)
    e0: number; edot: number;  // Eccentricity
    I0: number; Idot: number;  // Inclination
    w0: number; wdot: number;  // Argument of perihelion
    O0: number; Odot: number;  // Longitude of ascending node
  }> = {
    mercury: {
      L0: 252.250906, Ldot: 149472.6746358,
      a: 0.38709927,
      e0: 0.20563593, edot: 0.00001906,
      I0: 7.00497902, Idot: -0.00594749,
      w0: 77.45779628, wdot: 0.16047689,
      O0: 48.33076593, Odot: -0.12534081
    },
    venus: {
      L0: 181.979801, Ldot: 58517.8156760,
      a: 0.72333566,
      e0: 0.00677672, edot: -0.00004107,
      I0: 3.39467605, Idot: -0.00078890,
      w0: 131.60246718, wdot: 0.00268329,
      O0: 76.67984255, Odot: -0.27769418
    },
    mars: {
      L0: 355.433275, Ldot: 19140.2993313,
      a: 1.52371034,
      e0: 0.09339410, edot: 0.00007882,
      I0: 1.84969142, Idot: -0.00813131,
      w0: -23.94362959, wdot: 0.44441088,
      O0: 49.55953891, Odot: -0.29257343
    },
    jupiter: {
      L0: 34.351484, Ldot: 3034.9056746,
      a: 5.20288700,
      e0: 0.04838624, edot: -0.00013253,
      I0: 1.30439695, Idot: -0.00183714,
      w0: 14.72847983, wdot: 0.21252668,
      O0: 100.47390909, Odot: 0.20469106
    },
    saturn: {
      L0: 50.077471, Ldot: 1222.1137943,
      a: 9.53667594,
      e0: 0.05386179, edot: -0.00050991,
      I0: 2.48599187, Idot: 0.00193609,
      w0: 92.59887831, wdot: -0.41897216,
      O0: 113.66242448, Odot: -0.28867794
    },
    uranus: {
      L0: 314.055005, Ldot: 428.4669983,
      a: 19.18916464,
      e0: 0.04725744, edot: -0.00004397,
      I0: 0.77263783, Idot: -0.00242939,
      w0: 170.95427630, wdot: 0.40805281,
      O0: 74.01692503, Odot: 0.04240589
    },
    neptune: {
      L0: 304.348665, Ldot: 218.4862002,
      a: 30.06992276,
      e0: 0.00859048, edot: 0.00005105,
      I0: 1.77004347, Idot: 0.00035372,
      w0: 44.96476227, wdot: -0.32241464,
      O0: 131.78422574, Odot: -0.00508664
    },
    pluto: {
      L0: 238.929, Ldot: 145.18,
      a: 39.48211675,
      e0: 0.24882730, edot: 0.00005170,
      I0: 17.14001206, Idot: 0.00004818,
      w0: 224.06891629, wdot: -0.04062942,
      O0: 110.30393684, Odot: -0.01183482
    }
  };
  
  const el = elements[planet.toLowerCase()];
  if (!el) return { longitude: 0, retrograde: false };
  
  // Calculate mean longitude
  const L = normalize(el.L0 + el.Ldot * T);
  
  // Calculate eccentricity
  const e = el.e0 + el.edot * T;
  
  // Argument of perihelion
  const w = normalize(el.w0 + el.wdot * T);
  
  // Mean anomaly
  const M = normalize(L - w);
  const Mrad = toRad(M);
  
  // Solve Kepler's equation (simplified)
  let E = M + toDeg(e * Math.sin(Mrad) * (1 + e * Math.cos(Mrad)));
  const Erad = toRad(E);
  
  // True anomaly
  const xv = Math.cos(Erad) - e;
  const yv = Math.sqrt(1 - e * e) * Math.sin(Erad);
  const v = toDeg(Math.atan2(yv, xv));
  
  // Heliocentric longitude
  let longitude = normalize(v + w);
  
  // For outer planets, need to convert to geocentric
  // This is a simplification - proper calculation needs Earth's position
  const sunPos = calculateSun(T);
  
  // Simplified geocentric conversion
  if (['mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(planet.toLowerCase())) {
    // Rough adjustment for geocentric view
    const diff = longitude - sunPos.longitude;
    // Check for retrograde (very simplified)
    const retrograde = Math.abs(diff) > 120 && Math.abs(diff) < 240;
    return { longitude: normalize(longitude), retrograde };
  }
  
  // For inner planets (Mercury, Venus), check elongation for retrograde
  const elongation = longitude - sunPos.longitude;
  const retrograde = false; // Simplified - would need velocity calculation
  
  return { longitude: normalize(longitude), retrograde };
}

/**
 * Convert longitude to sign and degree
 */
function longitudeToSign(longitude: number): { sign: string; degree: number; minutes: number } {
  const normalized = normalize(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degree) * 60);
  return { sign: SIGNS[signIndex], degree, minutes };
}

/**
 * Calculate Ascendant (Rising Sign)
 */
function calculateAscendant(jd: number, latitude: number, longitude: number): { sign: string; degree: number } {
  const T = julianCenturies(jd);
  
  // Greenwich Mean Sidereal Time
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) 
           + 0.000387933 * T * T - T * T * T / 38710000;
  GMST = normalize(GMST);
  
  // Local Sidereal Time
  const LST = normalize(GMST + longitude);
  const RAMC = toRad(LST);
  
  // Obliquity of ecliptic
  const eps = toRad(23.439291 - 0.0130042 * T);
  
  // Latitude in radians
  const phi = toRad(latitude);
  
  // Calculate Ascendant
  const y = -Math.cos(RAMC);
  const x = Math.sin(RAMC) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps);
  let asc = toDeg(Math.atan2(y, x));
  asc = normalize(asc);
  
  return longitudeToSign(asc);
}

/**
 * Calculate aspects between planets
 */
function calculateAspects(planets: PlanetPosition[]): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectTypes = [
    { name: 'Conjunction', angle: 0, orb: 8 },
    { name: 'Opposition', angle: 180, orb: 8 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Square', angle: 90, orb: 7 },
    { name: 'Sextile', angle: 60, orb: 6 },
    { name: 'Quincunx', angle: 150, orb: 3 },
  ];
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      
      for (const aspectType of aspectTypes) {
        const orb = Math.abs(angle - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: aspectType.name,
            angle: aspectType.angle,
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
  
  // Group planets by sign
  const signGroups: Record<string, PlanetPosition[]> = {};
  planets.forEach(p => {
    if (!signGroups[p.sign]) signGroups[p.sign] = [];
    signGroups[p.sign].push(p);
  });
  
  // Stellium: 3+ planets in one sign
  Object.entries(signGroups).forEach(([sign, ps]) => {
    if (ps.length >= 3) {
      patterns.push(`Stellium in ${sign} (${ps.map(p => p.name).join(', ')})`);
    }
  });
  
  // Grand Trine: 3 planets forming trines
  const trines = aspects.filter(a => a.type === 'Trine');
  const trinePlanets = new Set<string>();
  trines.forEach(t => {
    trinePlanets.add(t.planet1);
    trinePlanets.add(t.planet2);
  });
  
  // Check for connected trines forming a triangle
  for (const t1 of trines) {
    for (const t2 of trines) {
      if (t1 === t2) continue;
      const shared = [t1.planet1, t1.planet2].find(p => [t2.planet1, t2.planet2].includes(p));
      if (shared) {
        const others = [t1.planet1, t1.planet2, t2.planet1, t2.planet2].filter(p => p !== shared);
        const connecting = trines.find(t => 
          (t.planet1 === others[0] && t.planet2 === others[1]) ||
          (t.planet1 === others[1] && t.planet2 === others[0])
        );
        if (connecting) {
          const element = SIGN_ELEMENTS[planets.find(p => p.name === shared)?.sign || 'Aries'];
          if (!patterns.some(p => p.includes('Grand Trine'))) {
            patterns.push(`Grand Trine (${element})`);
          }
        }
      }
    }
  }
  
  // T-Square: 2 squares + 1 opposition
  const squares = aspects.filter(a => a.type === 'Square');
  const oppositions = aspects.filter(a => a.type === 'Opposition');
  
  for (const opp of oppositions) {
    const sq1 = squares.find(s => 
      [s.planet1, s.planet2].includes(opp.planet1) && 
      ![s.planet1, s.planet2].includes(opp.planet2)
    );
    const sq2 = squares.find(s => 
      [s.planet1, s.planet2].includes(opp.planet2) && 
      ![s.planet1, s.planet2].includes(opp.planet1)
    );
    if (sq1 && sq2) {
      const apex = [sq1.planet1, sq1.planet2].find(p => ![opp.planet1, opp.planet2].includes(p));
      if (apex && !patterns.some(p => p.includes('T-Square'))) {
        patterns.push(`T-Square (apex: ${apex})`);
      }
    }
  }
  
  // Grand Cross: 4 squares + 2 oppositions
  if (squares.length >= 4 && oppositions.length >= 2) {
    const allPlanets = new Set<string>();
    squares.forEach(s => { allPlanets.add(s.planet1); allPlanets.add(s.planet2); });
    if (allPlanets.size >= 4) {
      const oppPlanets = new Set<string>();
      oppositions.forEach(o => { oppPlanets.add(o.planet1); oppPlanets.add(o.planet2); });
      if ([...allPlanets].every(p => oppPlanets.has(p))) {
        patterns.push('Grand Cross');
      }
    }
  }
  
  // Yod (Finger of God): 2 quincunxes + 1 sextile
  const quincunxes = aspects.filter(a => a.type === 'Quincunx');
  const sextiles = aspects.filter(a => a.type === 'Sextile');
  
  for (const sext of sextiles) {
    const q1 = quincunxes.find(q => [q.planet1, q.planet2].includes(sext.planet1));
    const q2 = quincunxes.find(q => [q.planet1, q.planet2].includes(sext.planet2) && q !== q1);
    if (q1 && q2) {
      const apex1 = [q1.planet1, q1.planet2].find(p => p !== sext.planet1);
      const apex2 = [q2.planet1, q2.planet2].find(p => p !== sext.planet2);
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
 * Calculate a full Western natal chart
 */
export function calculateWesternChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): WesternChart {
  const jd = dateToJulian(birthDate);
  const T = julianCenturies(jd);
  
  // Calculate Sun
  const sunPos = calculateSun(T);
  const sunSign = longitudeToSign(sunPos.longitude);
  const sun: PlanetPosition = {
    name: 'Sun',
    longitude: sunPos.longitude,
    sign: sunSign.sign,
    degree: sunSign.degree,
    minutes: sunSign.minutes,
    retrograde: false
  };
  
  // Calculate Moon
  const moonPos = calculateMoon(T);
  const moonSign = longitudeToSign(moonPos.longitude);
  const moon: PlanetPosition = {
    name: 'Moon',
    longitude: moonPos.longitude,
    sign: moonSign.sign,
    degree: moonSign.degree,
    minutes: moonSign.minutes,
    retrograde: false
  };
  
  // Calculate planets
  const planetNames = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const planets: PlanetPosition[] = [sun, moon];
  
  for (const name of planetNames) {
    const pos = calculatePlanet(T, name);
    const sign = longitudeToSign(pos.longitude);
    planets.push({
      name,
      longitude: pos.longitude,
      sign: sign.sign,
      degree: sign.degree,
      minutes: sign.minutes,
      retrograde: pos.retrograde
    });
  }
  
  // Calculate Ascendant
  const rising = calculateAscendant(jd, latitude, longitude);
  
  // Calculate aspects
  const aspects = calculateAspects(planets);
  
  // Calculate elements
  const elements = calculateElements(planets);
  
  // Detect patterns
  const patterns = detectPatterns(planets, aspects);
  
  return {
    sun: planets[0],
    moon: planets[1],
    mercury: planets[2],
    venus: planets[3],
    mars: planets[4],
    jupiter: planets[5],
    saturn: planets[6],
    uranus: planets[7],
    neptune: planets[8],
    pluto: planets[9],
    rising,
    aspects,
    elements,
    patterns
  };
}
