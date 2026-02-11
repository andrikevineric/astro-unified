'use client';

interface ChartData {
  sun: { sign: string; degree: number; house: number };
  moon: { sign: string; degree: number; house: number };
  rising: { sign: string; degree: number };
  mercury: { sign: string; degree: number; house: number };
  venus: { sign: string; degree: number; house: number };
  mars: { sign: string; degree: number; house: number };
  patterns: string[];
  elements: { Fire: number; Earth: number; Air: number; Water: number };
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂'
};

export function NatalChart({ data }: { data: ChartData }) {
  const size = 400;
  const center = size / 2;
  const outerRadius = 180;
  const innerRadius = 120;
  const planetRadius = 95;

  // Calculate planet positions (simplified)
  const getPlanetPosition = (sign: string, degree: number) => {
    const signIndex = SIGNS.indexOf(sign);
    const totalDegree = signIndex * 30 + degree;
    const angle = (totalDegree - 90) * (Math.PI / 180); // Offset by -90 to start at top
    return {
      x: center + planetRadius * Math.cos(angle),
      y: center + planetRadius * Math.sin(angle)
    };
  };

  const planets = [
    { name: 'sun', ...data.sun },
    { name: 'moon', ...data.moon },
    { name: 'mercury', ...data.mercury },
    { name: 'venus', ...data.venus },
    { name: 'mars', ...data.mars },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Natal Chart</h2>
      
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer ring - zodiac signs */}
          <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx={center} cy={center} r={innerRadius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
          
          {/* Sign divisions and labels */}
          {SIGNS.map((sign, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);
            const midAngle = ((i * 30 + 15) - 90) * (Math.PI / 180);
            
            const x1 = center + innerRadius * Math.cos(angle);
            const y1 = center + innerRadius * Math.sin(angle);
            const x2 = center + outerRadius * Math.cos(angle);
            const y2 = center + outerRadius * Math.sin(angle);
            
            const labelX = center + ((innerRadius + outerRadius) / 2) * Math.cos(midAngle);
            const labelY = center + ((innerRadius + outerRadius) / 2) * Math.sin(midAngle);
            
            // Determine element color
            const elementColors: Record<string, string> = {
              Fire: '#E85D04',
              Earth: '#606C38',
              Air: '#90E0EF',
              Water: '#023E8A'
            };
            const signElements: Record<string, string> = {
              Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
              Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
              Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
              Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
            };
            
            return (
              <g key={sign}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth="1" />
                <text 
                  x={labelX} 
                  y={labelY} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontSize="16"
                  fill={elementColors[signElements[sign]]}
                >
                  {SIGN_SYMBOLS[i]}
                </text>
              </g>
            );
          })}
          
          {/* House cusps (simplified - equal houses) */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = center + 40 * Math.cos(angle);
            const y1 = center + 40 * Math.sin(angle);
            const x2 = center + innerRadius * Math.cos(angle);
            const y2 = center + innerRadius * Math.sin(angle);
            
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="1" />
            );
          })}
          
          {/* Planets */}
          {planets.map((planet) => {
            const pos = getPlanetPosition(planet.sign, planet.degree);
            return (
              <g key={planet.name} className="cursor-pointer hover:opacity-80">
                <circle cx={pos.x} cy={pos.y} r="16" fill="white" stroke="#6366f1" strokeWidth="2" />
                <text 
                  x={pos.x} 
                  y={pos.y} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="#6366f1"
                >
                  {PLANET_SYMBOLS[planet.name]}
                </text>
              </g>
            );
          })}
          
          {/* Center */}
          <circle cx={center} cy={center} r="35" fill="#f8fafc" stroke="#e5e7eb" strokeWidth="1" />
          <text x={center} y={center - 8} textAnchor="middle" fontSize="10" fill="#6b7280">ASC</text>
          <text x={center} y={center + 8} textAnchor="middle" fontSize="12" fill="#374151" fontWeight="600">
            {data.rising.sign.slice(0, 3)}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {planets.map((planet) => (
          <div key={planet.name} className="flex items-center gap-2">
            <span className="text-purple-600">{PLANET_SYMBOLS[planet.name]}</span>
            <span className="capitalize text-gray-700">{planet.name}:</span>
            <span className="text-gray-500">{planet.sign} {planet.degree}°</span>
          </div>
        ))}
      </div>

      {/* Patterns */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Detected Patterns</h3>
        <div className="flex flex-wrap gap-2">
          {data.patterns.map((pattern) => (
            <span key={pattern} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              {pattern}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
