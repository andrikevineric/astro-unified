'use client';

import { WesternChart } from '@/lib/western';
import { BaziChart } from '@/lib/bazi';
import { CrossRefAnalysis } from '@/lib/crossref';

interface SummaryProps {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  western: WesternChart;
  bazi: BaziChart;
  crossRef: CrossRefAnalysis;
}

export function Summary({ name, birthDate, birthTime, birthPlace, western, bazi, crossRef }: SummaryProps) {
  const formatPosition = (p: { sign: string; degree: number; minutes: number; retrograde?: boolean }) => 
    `${p.sign} ${p.degree}°${p.minutes.toString().padStart(2, '0')}'${p.retrograde ? ' R' : ''}`;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">{name || 'Birth Chart Summary'}</h2>
        <div className="flex flex-wrap gap-4 text-sm opacity-90">
          <span>{birthDate}</span>
          <span>{birthTime}</span>
          <span>{birthPlace}</span>
        </div>
      </div>

      {/* Core Identity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IdentityCard 
          title="Sun Sign" 
          value={western.sun.sign}
          detail={`${western.sun.degree}°${western.sun.minutes}'`}
          description="Your core identity, ego, and life purpose"
          color="from-yellow-400 to-orange-500"
        />
        <IdentityCard 
          title="Moon Sign" 
          value={western.moon.sign}
          detail={`${western.moon.degree}°${western.moon.minutes}'`}
          description="Your emotional nature and inner self"
          color="from-slate-300 to-slate-500"
        />
        <IdentityCard 
          title="Rising Sign" 
          value={western.rising.sign}
          detail={`${western.rising.degree}°${western.rising.minutes}'`}
          description="Your outward persona and first impressions"
          color="from-purple-400 to-pink-500"
        />
      </div>

      {/* Chinese Astrology Quick View */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Chinese Astrology</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PillarMini title="Year" pillar={bazi.year} />
          <PillarMini title="Month" pillar={bazi.month} />
          <PillarMini title="Day" pillar={bazi.day} />
          <PillarMini title="Hour" pillar={bazi.hour} />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">Day Master:</span> {bazi.dayMaster} ({bazi.dayMasterElement})
          </p>
        </div>
      </div>

      {/* Planetary Positions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Planetary Positions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <PlanetRow name="Sun" position={western.sun} />
          <PlanetRow name="Moon" position={western.moon} />
          <PlanetRow name="Mercury" position={western.mercury} />
          <PlanetRow name="Venus" position={western.venus} />
          <PlanetRow name="Mars" position={western.mars} />
          <PlanetRow name="Jupiter" position={western.jupiter} />
          <PlanetRow name="Saturn" position={western.saturn} />
          <PlanetRow name="Uranus" position={western.uranus} />
          <PlanetRow name="Neptune" position={western.neptune} />
          <PlanetRow name="Pluto" position={western.pluto} />
          <PlanetRow name="North Node" position={western.northNode} />
          <PlanetRow name="Chiron" position={western.chiron} />
        </div>
      </div>

      {/* Houses */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">House Cusps</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {western.houses.map((cusp, i) => {
            const pos = toPosition(cusp);
            return (
              <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">House {i + 1}</div>
                <div className="font-medium text-gray-900">{pos.sign.slice(0, 3)}</div>
                <div className="text-xs text-gray-600">{pos.degree}°{pos.minutes}'</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Element & Modality Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Element Balance</h3>
          <div className="space-y-3">
            <ElementBar label="Fire" value={western.elements.Fire} color="bg-red-500" />
            <ElementBar label="Earth" value={western.elements.Earth} color="bg-amber-600" />
            <ElementBar label="Air" value={western.elements.Air} color="bg-sky-500" />
            <ElementBar label="Water" value={western.elements.Water} color="bg-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Modality Balance</h3>
          <div className="space-y-3">
            <ElementBar label="Cardinal" value={western.modalities.Cardinal} color="bg-purple-500" />
            <ElementBar label="Fixed" value={western.modalities.Fixed} color="bg-green-500" />
            <ElementBar label="Mutable" value={western.modalities.Mutable} color="bg-orange-500" />
          </div>
        </div>
      </div>

      {/* Cross-Reference Harmony */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">East-West Harmony Analysis</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${crossRef.harmonyScore}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-purple-600">{crossRef.harmonyScore}%</span>
        </div>
        
        {crossRef.reinforcing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reinforcing Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {crossRef.reinforcing.map((pattern, i) => (
                <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full">
                  {pattern.element}: {pattern.note}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {crossRef.balancing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Balancing Factors</h4>
            <div className="flex flex-wrap gap-2">
              {crossRef.balancing.map((pattern, i) => (
                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {pattern.element}: {pattern.note}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {crossRef.synthesis && (
          <p className="text-sm text-gray-600 mt-4">{crossRef.synthesis}</p>
        )}
      </div>

      {/* Aspects Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Major Aspects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {western.aspects
            .filter(a => ['Conjunction', 'Opposition', 'Trine', 'Square', 'Sextile'].includes(a.type))
            .slice(0, 12)
            .map((aspect, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">
                  {aspect.planet1} {getAspectSymbol(aspect.type)} {aspect.planet2}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${getAspectColor(aspect.type)}`}>
                  {aspect.type} ({aspect.orb.toFixed(1)}°)
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Chart Patterns */}
      {western.patterns.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Chart Patterns</h3>
          <div className="flex flex-wrap gap-2">
            {western.patterns.map((pattern, i) => (
              <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Five Elements (Bazi) */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Five Elements (Bazi)</h3>
        <div className="space-y-3">
          <ElementBar label="Wood" value={bazi.elements.Wood} color="bg-green-500" />
          <ElementBar label="Fire" value={bazi.elements.Fire} color="bg-red-500" />
          <ElementBar label="Earth" value={bazi.elements.Earth} color="bg-amber-600" />
          <ElementBar label="Metal" value={bazi.elements.Metal} color="bg-gray-500" />
          <ElementBar label="Water" value={bazi.elements.Water} color="bg-blue-500" />
        </div>
      </div>
    </div>
  );
}

// Helper components
function IdentityCard({ title, value, detail, description, color }: { 
  title: string; 
  value: string; 
  detail: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-10 rounded-bl-full`} />
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-purple-600 mb-2">{detail}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  );
}

function PillarMini({ title, pillar }: { 
  title: string; 
  pillar: { stemChinese: string; branchChinese: string; branchAnimal: string; stem: string };
}) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-xl font-bold text-gray-900">{pillar.stemChinese}{pillar.branchChinese}</div>
      <div className="text-xs text-gray-600">{pillar.branchAnimal}</div>
    </div>
  );
}

function PlanetRow({ name, position }: { 
  name: string; 
  position: { sign: string; degree: number; minutes: number; retrograde?: boolean; house?: number };
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">{name}</span>
        {position.retrograde && <span className="text-xs text-red-500">R</span>}
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-900">{position.sign.slice(0, 3)} {position.degree}°</div>
        {position.house && <div className="text-xs text-gray-500">H{position.house}</div>}
      </div>
    </div>
  );
}

function ElementBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-16">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm text-gray-900 w-10 text-right">{value}%</span>
    </div>
  );
}

function toPosition(longitude: number): { sign: string; degree: number; minutes: number } {
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return { 
    sign: SIGNS[signIndex], 
    degree: Math.floor(degreeInSign), 
    minutes: Math.floor((degreeInSign % 1) * 60)
  };
}

function getAspectSymbol(type: string): string {
  const symbols: Record<string, string> = {
    Conjunction: '\u260C',
    Opposition: '\u260D',
    Trine: '\u25B3',
    Square: '\u25A1',
    Sextile: '\u2731',
  };
  return symbols[type] || '-';
}

function getAspectColor(type: string): string {
  const colors: Record<string, string> = {
    Conjunction: 'bg-purple-100 text-purple-700',
    Opposition: 'bg-red-100 text-red-700',
    Trine: 'bg-green-100 text-green-700',
    Square: 'bg-orange-100 text-orange-700',
    Sextile: 'bg-blue-100 text-blue-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}
