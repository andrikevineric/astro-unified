'use client';

interface PlanetData {
  sign: string;
  degree: number;
  minutes?: number;
  retrograde?: boolean;
}

interface ChartData {
  sun: PlanetData & { house?: number };
  moon: PlanetData & { house?: number };
  rising: { sign: string; degree: number };
  mercury: PlanetData & { house?: number };
  venus: PlanetData & { house?: number };
  mars: PlanetData & { house?: number };
  jupiter?: PlanetData & { house?: number };
  saturn?: PlanetData & { house?: number };
  uranus?: PlanetData & { house?: number };
  neptune?: PlanetData & { house?: number };
  pluto?: PlanetData & { house?: number };
  patterns: string[];
  elements: { Fire: number; Earth: number; Air: number; Water: number };
  aspects?: Array<{ planet1: string; planet2: string; type: string; orb: number }>;
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇'
};

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
};

const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#E85D04',
  Earth: '#606C38',
  Air: '#90E0EF',
  Water: '#023E8A'
};

export function NatalChart({ data }: { data: ChartData }) {
  const size = 420;
  const center = size / 2;
  const outerRadius = 190;
  const innerRadius = 130;
  const planetRadius = 100;

  const getPlanetPosition = (sign: string, degree: number) => {
    const signIndex = SIGNS.indexOf(sign);
    if (signIndex === -1) return { x: center, y: center };
    const totalDegree = signIndex * 30 + degree;
    const angle = (totalDegree - 90) * (Math.PI / 180);
    return {
      x: center + planetRadius * Math.cos(angle),
      y: center + planetRadius * Math.sin(angle)
    };
  };

  // All planets
  const allPlanets = [
    { name: 'sun', ...data.sun },
    { name: 'moon', ...data.moon },
    { name: 'mercury', ...data.mercury },
    { name: 'venus', ...data.venus },
    { name: 'mars', ...data.mars },
    ...(data.jupiter ? [{ name: 'jupiter', ...data.jupiter }] : []),
    ...(data.saturn ? [{ name: 'saturn', ...data.saturn }] : []),
    ...(data.uranus ? [{ name: 'uranus', ...data.uranus }] : []),
    ...(data.neptune ? [{ name: 'neptune', ...data.neptune }] : []),
    ...(data.pluto ? [{ name: 'pluto', ...data.pluto }] : []),
  ];

  const formatDegree = (planet: PlanetData) => {
    const mins = planet.minutes !== undefined ? `${planet.minutes}'` : '';
    const retro = planet.retrograde ? ' ℞' : '';
    return `${planet.degree}°${mins}${retro}`;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Natal Chart</h2>
      
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer ring */}
          <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
          
          {/* Sign divisions and labels */}
          {SIGNS.map((sign, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const midAngle = ((i * 30 + 15) - 90) * (Math.PI / 180);
            
            const x1 = center + innerRadius * Math.cos(angle);
            const y1 = center + innerRadius * Math.sin(angle);
            const x2 = center + outerRadius * Math.cos(angle);
            const y2 = center + outerRadius * Math.sin(angle);
            
            const labelX = center + ((innerRadius + outerRadius) / 2) * Math.cos(midAngle);
            const labelY = center + ((innerRadius + outerRadius) / 2) * Math.sin(midAngle);
            
            const elementColor = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
            
            return (
              <g key={sign}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth="1" />
                <text 
                  x={labelX} 
                  y={labelY} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontSize="18"
                  fill={elementColor}
                >
                  {SIGN_SYMBOLS[i]}
                </text>
              </g>
            );
          })}
          
          {/* House cusps */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = center + 45 * Math.cos(angle);
            const y1 = center + 45 * Math.sin(angle);
            const x2 = center + innerRadius * Math.cos(angle);
            const y2 = center + innerRadius * Math.sin(angle);
            
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="1" />
            );
          })}
          
          {/* Planets */}
          {allPlanets.map((planet) => {
            const pos = getPlanetPosition(planet.sign, planet.degree);
            const isRetro = 'retrograde' in planet && planet.retrograde;
            return (
              <g key={planet.name} className="cursor-pointer">
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="15" 
                  fill="white" 
                  stroke={isRetro ? "#dc2626" : "#6366f1"} 
                  strokeWidth="2" 
                />
                <text 
                  x={pos.x} 
                  y={pos.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontSize="13"
                  fill={isRetro ? "#dc2626" : "#6366f1"}
                >
                  {PLANET_SYMBOLS[planet.name]}
                </text>
              </g>
            );
          })}
          
          {/* Center - Ascendant */}
          <circle cx={center} cy={center} r="40" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="1" />
          <text x={center} y={center - 10} textAnchor="middle" fontSize="10" fill="#6b7280">ASC</text>
          <text x={center} y={center + 6} textAnchor="middle" fontSize="13" fill="#374151" fontWeight="600">
            {data.rising.sign}
          </text>
          <text x={center} y={center + 20} textAnchor="middle" fontSize="10" fill="#6b7280">
            {data.rising.degree}°
          </text>
        </svg>
      </div>

      {/* Planet Positions Table */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Planet Positions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {allPlanets.map((planet) => (
            <div key={planet.name} className="flex items-center gap-2 py-1">
              <span className="text-purple-600 w-5">{PLANET_SYMBOLS[planet.name]}</span>
              <span className="capitalize text-gray-700 w-16">{planet.name}</span>
              <span className="text-gray-500">
                {planet.sign} {formatDegree(planet)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Aspects */}
      {data.aspects && data.aspects.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Major Aspects</h3>
          <div className="flex flex-wrap gap-2">
            {data.aspects.slice(0, 12).map((aspect, i) => (
              <span 
                key={i} 
                className={`px-2 py-1 text-xs rounded ${
                  aspect.type === 'Conjunction' ? 'bg-purple-100 text-purple-700' :
                  aspect.type === 'Trine' ? 'bg-green-100 text-green-700' :
                  aspect.type === 'Sextile' ? 'bg-blue-100 text-blue-700' :
                  aspect.type === 'Square' ? 'bg-red-100 text-red-700' :
                  aspect.type === 'Opposition' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}
              >
                {PLANET_SYMBOLS[aspect.planet1.toLowerCase()]} {aspect.type} {PLANET_SYMBOLS[aspect.planet2.toLowerCase()]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Element Distribution */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Element Balance</h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(data.elements).map(([element, value]) => (
            <div key={element} className="text-center">
              <div 
                className="h-2 rounded-full mb-1"
                style={{ 
                  backgroundColor: ELEMENT_COLORS[element],
                  opacity: 0.3 + (value / 100) * 0.7
                }}
              />
              <span className="text-xs text-gray-600">{element}</span>
              <span className="text-xs text-gray-400 ml-1">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {data.patterns.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Chart Patterns</h3>
          <div className="flex flex-wrap gap-2">
            {data.patterns.map((pattern) => (
              <span key={pattern} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
