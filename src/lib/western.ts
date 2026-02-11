/**
 * Western Astrology Calculations
 * Uses high-accuracy VSOP87 planetary theory
 */

import {
  toJulianDay,
  toJulianCenturies,
  calcSunPosition,
  calcMoonPosition,
  calcPlanetPosition,
  calcHouses,
  calcLunarNodes,
  calcChiron
} from './vsop87';

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

const SIGN_MODALITIES: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable'
};

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude?: number;
  sign: string;
  degree: number;
  minutes: number;
  retrograde: boolean;
  house?: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
  applying: boolean;
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
  northNode: PlanetPosition;
  chiron: PlanetPosition;
  rising: { sign: string; degree: number; minutes: number };
  midheaven: { sign: string; degree: number; minutes: number };
  houses: number[];
  aspects: Aspect[];
  elements: { Fire: number; Earth: number; Air: number; Water: number };
  modalities: { Cardinal: number; Fixed: number; Mutable: number };
  patterns: string[];
}

function longitudeToPosition(longitude: number): { sign: string; degree: number; minutes: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.floor((degreeInSign - degree) * 60);
  return { sign: SIGNS[signIndex], degree, minutes };
}

function createPlanetPosition(
  name: string, 
  longitude: number, 
  latitude: number = 0,
  retrograde: boolean = false,
  houses?: number[]
): PlanetPosition {
  const pos = longitudeToPosition(longitude);
  
  let house: number | undefined;
  if (houses) {
    for (let i = 0; i < 12; i++) {
      const nextHouse = (i + 1) % 12;
      let start = houses[i];
      let end = houses[nextHouse];
      if (end < start) end += 360;
      let lng = longitude;
      if (lng < start) lng += 360;
      if (lng >= start && lng < end) {
        house = i + 1;
        break;
      }
    }
  }
  
  return {
    name,
    longitude: Math.round(longitude * 10000) / 10000,
    latitude: Math.round(latitude * 10000) / 10000,
    sign: pos.sign,
    degree: pos.degree,
    minutes: pos.minutes,
    retrograde,
    house
  };
}

function isRetrograde(planet: string, jd: number): boolean {
  const dt = 1; // 1 day
  const pos1 = calcPlanetPosition(planet, jd - dt);
  const pos2 = calcPlanetPosition(planet, jd + dt);
  
  let diff = pos2.longitude - pos1.longitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  
  return diff < 0;
}

function calculateAspects(planets: PlanetPosition[], jd: number): Aspect[] {
  const aspects: Aspect[] = [];
  const aspectDefs = [
    { name: 'Conjunction', angle: 0, orb: 10 },
    { name: 'Opposition', angle: 180, orb: 10 },
    { name: 'Trine', angle: 120, orb: 8 },
    { name: 'Square', angle: 90, orb: 8 },
    { name: 'Sextile', angle: 60, orb: 6 },
    { name: 'Quincunx', angle: 150, orb: 3 },
    { name: 'Semi-sextile', angle: 30, orb: 2 },
    { name: 'Semi-square', angle: 45, orb: 2 },
    { name: 'Sesquiquadrate', angle: 135, orb: 2 },
    { name: 'Quintile', angle: 72, orb: 2 },
    { name: 'Bi-quintile', angle: 144, orb: 2 },
  ];
  
  // Wider orbs for luminaries
  const getOrb = (p1: string, p2: string, baseOrb: number) => {
    const isLuminary = (n: string) => n === 'Sun' || n === 'Moon';
    if (isLuminary(p1) && isLuminary(p2)) return baseOrb + 2;
    if (isLuminary(p1) || isLuminary(p2)) return baseOrb + 1;
    return baseOrb;
  };
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const def of aspectDefs) {
        const orbAllowed = getOrb(planets[i].name, planets[j].name, def.orb);
        const orb = Math.abs(diff - def.angle);
        if (orb <= orbAllowed) {
          // Determine if applying or separating
          const applying = diff < def.angle;
          
          aspects.push({
            planet1: planets[i].name,
            planet2: planets[j].name,
            type: def.name,
            angle: def.angle,
            orb: Math.round(orb * 100) / 100,
            applying
          });
          break;
        }
      }
    }
  }
  
  return aspects;
}

function detectPatterns(planets: PlanetPosition[], aspects: Aspect[]): string[] {
  const patterns: string[] = [];
  
  // Stellium: 4+ planets within 20° or in same sign
  const signCounts: Record<string, PlanetPosition[]> = {};
  planets.forEach(p => {
    if (!signCounts[p.sign]) signCounts[p.sign] = [];
    signCounts[p.sign].push(p);
  });
  
  Object.entries(signCounts).forEach(([sign, ps]) => {
    if (ps.length >= 4) {
      patterns.push(`Stellium in ${sign} (${ps.map(p => p.name).join(', ')})`);
    }
  });
  
  // Grand Trine
  const trines = aspects.filter(a => a.type === 'Trine');
  if (trines.length >= 3) {
    const planetSet = new Set<string>();
    trines.forEach(t => { planetSet.add(t.planet1); planetSet.add(t.planet2); });
    const planetArr = Array.from(planetSet);
    
    for (let i = 0; i < planetArr.length - 2; i++) {
      for (let j = i + 1; j < planetArr.length - 1; j++) {
        for (let k = j + 1; k < planetArr.length; k++) {
          const [p1, p2, p3] = [planetArr[i], planetArr[j], planetArr[k]];
          const hasT1 = trines.some(t => (t.planet1 === p1 && t.planet2 === p2) || (t.planet1 === p2 && t.planet2 === p1));
          const hasT2 = trines.some(t => (t.planet1 === p2 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p2));
          const hasT3 = trines.some(t => (t.planet1 === p1 && t.planet2 === p3) || (t.planet1 === p3 && t.planet2 === p1));
          
          if (hasT1 && hasT2 && hasT3) {
            const p1Sign = planets.find(p => p.name === p1)?.sign || '';
            const element = SIGN_ELEMENTS[p1Sign] || 'Fire';
            if (!patterns.some(p => p.includes('Grand Trine'))) {
              patterns.push(`Grand Trine in ${element} (${p1}, ${p2}, ${p3})`);
            }
          }
        }
      }
    }
  }
  
  // Grand Cross
  const squares = aspects.filter(a => a.type === 'Square');
  const oppositions = aspects.filter(a => a.type === 'Opposition');
  
  if (oppositions.length >= 2 && squares.length >= 4) {
    for (let i = 0; i < oppositions.length - 1; i++) {
      for (let j = i + 1; j < oppositions.length; j++) {
        const opp1 = oppositions[i];
        const opp2 = oppositions[j];
        const all4 = [opp1.planet1, opp1.planet2, opp2.planet1, opp2.planet2];
        if (new Set(all4).size === 4) {
          // Check if all four are connected by squares
          let squareCount = 0;
          for (let a = 0; a < 4; a++) {
            for (let b = a + 1; b < 4; b++) {
              if (squares.some(s => 
                (s.planet1 === all4[a] && s.planet2 === all4[b]) ||
                (s.planet1 === all4[b] && s.planet2 === all4[a])
              )) {
                squareCount++;
              }
            }
          }
          if (squareCount >= 4 && !patterns.some(p => p.includes('Grand Cross'))) {
            const p1Sign = planets.find(p => p.name === all4[0])?.sign || '';
            const modality = SIGN_MODALITIES[p1Sign] || 'Cardinal';
            patterns.push(`Grand Cross in ${modality} signs`);
          }
        }
      }
    }
  }
  
  // T-Square
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
      }
    }
  }
  
  // Yod (Finger of God)
  const quincunxes = aspects.filter(a => a.type === 'Quincunx');
  const sextiles = aspects.filter(a => a.type === 'Sextile');
  
  for (const sext of sextiles) {
    const q1 = quincunxes.find(q => 
      (q.planet1 === sext.planet1 || q.planet2 === sext.planet1)
    );
    const q2 = quincunxes.find(q => 
      q !== q1 && (q.planet1 === sext.planet2 || q.planet2 === sext.planet2)
    );
    
    if (q1 && q2) {
      const apex1 = q1.planet1 === sext.planet1 ? q1.planet2 : q1.planet1;
      const apex2 = q2.planet1 === sext.planet2 ? q2.planet2 : q2.planet1;
      if (apex1 === apex2 && !patterns.some(p => p.includes('Yod'))) {
        patterns.push(`Yod (apex: ${apex1})`);
      }
    }
  }
  
  // Kite (Grand Trine + Opposition)
  if (patterns.some(p => p.includes('Grand Trine'))) {
    for (const opp of oppositions) {
      const gtPlanets = trines.flatMap(t => [t.planet1, t.planet2]);
      if (gtPlanets.includes(opp.planet1) || gtPlanets.includes(opp.planet2)) {
        if (!patterns.some(p => p.includes('Kite'))) {
          patterns.push('Kite configuration');
        }
      }
    }
  }
  
  // Mystic Rectangle
  if (oppositions.length >= 2 && sextiles.length >= 2 && trines.length >= 2) {
    // Check for rectangle pattern
    for (let i = 0; i < oppositions.length - 1; i++) {
      for (let j = i + 1; j < oppositions.length; j++) {
        const all4 = [oppositions[i].planet1, oppositions[i].planet2, 
                      oppositions[j].planet1, oppositions[j].planet2];
        if (new Set(all4).size === 4) {
          let sextCount = 0, trineCount = 0;
          for (let a = 0; a < 4; a++) {
            for (let b = a + 1; b < 4; b++) {
              if (sextiles.some(s => 
                (s.planet1 === all4[a] && s.planet2 === all4[b]) ||
                (s.planet1 === all4[b] && s.planet2 === all4[a]))) sextCount++;
              if (trines.some(t => 
                (t.planet1 === all4[a] && t.planet2 === all4[b]) ||
                (t.planet1 === all4[b] && t.planet2 === all4[a]))) trineCount++;
            }
          }
          if (sextCount >= 2 && trineCount >= 2 && !patterns.some(p => p.includes('Mystic Rectangle'))) {
            patterns.push('Mystic Rectangle');
          }
        }
      }
    }
  }
  
  return patterns;
}

function calculateElements(planets: PlanetPosition[]): { Fire: number; Earth: number; Air: number; Water: number } {
  const weights: Record<string, number> = {
    Sun: 4, Moon: 4, Mercury: 3, Venus: 3, Mars: 3,
    Jupiter: 2, Saturn: 2, Uranus: 1, Neptune: 1, Pluto: 1,
    'North Node': 1, Chiron: 1
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

function calculateModalities(planets: PlanetPosition[]): { Cardinal: number; Fixed: number; Mutable: number } {
  const weights: Record<string, number> = {
    Sun: 4, Moon: 4, Mercury: 3, Venus: 3, Mars: 3,
    Jupiter: 2, Saturn: 2, Uranus: 1, Neptune: 1, Pluto: 1
  };
  
  const counts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  let total = 0;
  
  planets.forEach(p => {
    const modality = SIGN_MODALITIES[p.sign];
    const weight = weights[p.name] || 1;
    if (modality) {
      counts[modality] += weight;
      total += weight;
    }
  });
  
  if (total === 0) return { Cardinal: 33, Fixed: 33, Mutable: 34 };
  
  return {
    Cardinal: Math.round((counts.Cardinal / total) * 100),
    Fixed: Math.round((counts.Fixed / total) * 100),
    Mutable: Math.round((counts.Mutable / total) * 100),
  };
}

export function calculateWesternChart(
  birthDate: Date,
  latitude: number,
  longitude: number
): WesternChart {
  const jd = toJulianDay(birthDate);
  
  // Calculate houses first
  const houses = calcHouses(jd, latitude, longitude);
  
  // Sun position (high accuracy)
  const sunPos = calcSunPosition(jd);
  const sun = createPlanetPosition('Sun', sunPos.longitude, sunPos.latitude, false, houses);
  
  // Moon position (high accuracy)
  const moonPos = calcMoonPosition(jd);
  const moon = createPlanetPosition('Moon', moonPos.longitude, moonPos.latitude, false, houses);
  
  // Planet positions
  const mercuryPos = calcPlanetPosition('Mercury', jd);
  const mercury = createPlanetPosition('Mercury', mercuryPos.longitude, mercuryPos.latitude, isRetrograde('Mercury', jd), houses);
  
  const venusPos = calcPlanetPosition('Venus', jd);
  const venus = createPlanetPosition('Venus', venusPos.longitude, venusPos.latitude, isRetrograde('Venus', jd), houses);
  
  const marsPos = calcPlanetPosition('Mars', jd);
  const mars = createPlanetPosition('Mars', marsPos.longitude, marsPos.latitude, isRetrograde('Mars', jd), houses);
  
  const jupiterPos = calcPlanetPosition('Jupiter', jd);
  const jupiter = createPlanetPosition('Jupiter', jupiterPos.longitude, jupiterPos.latitude, isRetrograde('Jupiter', jd), houses);
  
  const saturnPos = calcPlanetPosition('Saturn', jd);
  const saturn = createPlanetPosition('Saturn', saturnPos.longitude, saturnPos.latitude, isRetrograde('Saturn', jd), houses);
  
  const uranusPos = calcPlanetPosition('Uranus', jd);
  const uranus = createPlanetPosition('Uranus', uranusPos.longitude, uranusPos.latitude, isRetrograde('Uranus', jd), houses);
  
  const neptunePos = calcPlanetPosition('Neptune', jd);
  const neptune = createPlanetPosition('Neptune', neptunePos.longitude, neptunePos.latitude, isRetrograde('Neptune', jd), houses);
  
  const plutoPos = calcPlanetPosition('Pluto', jd);
  const pluto = createPlanetPosition('Pluto', plutoPos.longitude, plutoPos.latitude, isRetrograde('Pluto', jd), houses);
  
  // Lunar nodes
  const nodes = calcLunarNodes(jd);
  const northNode = createPlanetPosition('North Node', nodes.northNode, 0, false, houses);
  
  // Chiron
  const chironLong = calcChiron(jd);
  const chiron = createPlanetPosition('Chiron', chironLong, 0, false, houses);
  
  // Ascendant and Midheaven
  const risingPos = longitudeToPosition(houses[0]);
  const rising = { sign: risingPos.sign, degree: risingPos.degree, minutes: risingPos.minutes };
  
  const mcPos = longitudeToPosition(houses[9]);
  const midheaven = { sign: mcPos.sign, degree: mcPos.degree, minutes: mcPos.minutes };
  
  const planets = [sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, northNode, chiron];
  
  const aspects = calculateAspects(planets, jd);
  const elements = calculateElements(planets);
  const modalities = calculateModalities(planets);
  const patterns = detectPatterns(planets, aspects);
  
  return {
    sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto,
    northNode, chiron,
    rising, midheaven, houses,
    aspects, elements, modalities, patterns
  };
}
