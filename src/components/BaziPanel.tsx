'use client';

interface BaziData {
  pillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  dayMaster: string;
  elements: { Wood: number; Fire: number; Earth: number; Metal: number; Water: number };
}

const ELEMENT_COLORS: Record<string, string> = {
  Wood: '#2D6A4F',
  Fire: '#E85D04',
  Earth: '#606C38',
  Metal: '#6C757D',
  Water: '#023E8A'
};

export function BaziPanel({ data }: { data: BaziData }) {
  const pillars: Array<{ name: string; stem: string; branch: string; isDayMaster?: boolean }> = [
    { name: 'Hour', ...data.pillars.hour },
    { name: 'Day', ...data.pillars.day, isDayMaster: true },
    { name: 'Month', ...data.pillars.month },
    { name: 'Year', ...data.pillars.year },
  ];

  const getElementFromStem = (stem: string): string => {
    if (stem.includes('Wood') || stem.includes('Jia') || stem.includes('Yi')) return 'Wood';
    if (stem.includes('Fire') || stem.includes('Bing') || stem.includes('Ding')) return 'Fire';
    if (stem.includes('Earth') || stem.includes('Wu') || stem.includes('Ji')) return 'Earth';
    if (stem.includes('Metal') || stem.includes('Geng') || stem.includes('Xin')) return 'Metal';
    if (stem.includes('Water') || stem.includes('Ren') || stem.includes('Gui')) return 'Water';
    return 'Earth';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Bazi - Four Pillars of Destiny</h2>
      
      {/* Pillars Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {pillars.map((pillar) => {
          const element = getElementFromStem(pillar.stem);
          return (
            <div 
              key={pillar.name}
              className={`text-center p-4 rounded-lg border-2 ${
                pillar.isDayMaster 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500 mb-2">{pillar.name} Pillar</div>
              
              {/* Heavenly Stem */}
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: ELEMENT_COLORS[element] }}
              >
                {pillar.stem.split(' ')[0]}
              </div>
              <div className="text-xs text-gray-600 mb-3">
                {pillar.stem.split(' ').slice(1).join(' ')}
              </div>
              
              {/* Earthly Branch */}
              <div className="text-xl font-medium text-gray-700">
                {pillar.branch.split(' ')[0]}
              </div>
              <div className="text-xs text-gray-500">
                {pillar.branch.split(' ').slice(1).join(' ')}
              </div>
              
              {pillar.isDayMaster && (
                <div className="mt-2 text-xs text-purple-600 font-medium">
                  Day Master
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Master Explanation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-2">Your Day Master: {data.dayMaster}</h3>
        <p className="text-sm text-gray-600">
          The Day Master represents your core self. As {data.dayMaster}, you are like a tall, 
          sturdy tree - principled, upright, and always growing toward the light. You provide 
          shelter and stability to those around you.
        </p>
      </div>

      {/* Element Balance */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Five Elements Balance</h3>
        <div className="space-y-3">
          {(Object.keys(data.elements) as Array<keyof typeof data.elements>).map((element) => {
            const value = data.elements[element];
            const isStrong = value >= 25;
            const isWeak = value <= 10;
            
            return (
              <div key={element} className="flex items-center gap-3">
                <div 
                  className="w-16 text-sm font-medium"
                  style={{ color: ELEMENT_COLORS[element] }}
                >
                  {element}
                </div>
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${value}%`,
                      backgroundColor: ELEMENT_COLORS[element]
                    }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-600">{value}%</div>
                {isStrong && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Strong</span>
                )}
                {isWeak && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Weak</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Element Cycle Diagram */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Five Element Cycles</h3>
        <div className="flex justify-center">
          <svg width="200" height="180" viewBox="0 0 200 180">
            {/* Productive cycle arrows (circle) */}
            <circle cx="100" cy="90" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            
            {/* Elements positioned in generating order */}
            {[
              { el: 'Wood', x: 100, y: 30 },
              { el: 'Fire', x: 157, y: 65 },
              { el: 'Earth', x: 140, y: 130 },
              { el: 'Metal', x: 60, y: 130 },
              { el: 'Water', x: 43, y: 65 },
            ].map(({ el, x, y }) => (
              <g key={el}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="18" 
                  fill="white"
                  stroke={ELEMENT_COLORS[el as keyof typeof ELEMENT_COLORS]} 
                  strokeWidth="2" 
                />
                <text 
                  x={x} 
                  y={y + 4} 
                  textAnchor="middle" 
                  fontSize="10"
                  fill={ELEMENT_COLORS[el as keyof typeof ELEMENT_COLORS]}
                >
                  {el.slice(0, 2)}
                </text>
              </g>
            ))}
            
            {/* Legend */}
            <text x="100" y="170" textAnchor="middle" fontSize="9" fill="#6b7280">
              Wood → Fire → Earth → Metal → Water → Wood
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
