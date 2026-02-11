'use client';

import { useState } from 'react';
import { NatalChart } from '@/components/NatalChart';
import { BaziPanel } from '@/components/BaziPanel';
import { CrossReference } from '@/components/CrossReference';
import { CompatibilityForm } from '@/components/CompatibilityForm';
import { BirthDataForm } from '@/components/BirthDataForm';

type Tab = 'western' | 'bazi' | 'crossref' | 'compatibility';

// Mock data for demonstration
const MOCK_CHART = {
  sun: { sign: 'Leo', degree: 15, house: 10 },
  moon: { sign: 'Cancer', degree: 8, house: 9 },
  rising: { sign: 'Scorpio', degree: 22 },
  mercury: { sign: 'Virgo', degree: 3, house: 11 },
  venus: { sign: 'Leo', degree: 28, house: 10 },
  mars: { sign: 'Aries', degree: 12, house: 6 },
  patterns: ['Stellium in Leo', 'Grand Trine (Fire)'],
  elements: { Fire: 40, Earth: 20, Air: 15, Water: 25 }
};

const MOCK_BAZI = {
  pillars: {
    year: { stem: '壬 Ren (Water)', branch: '辰 Chen (Dragon)' },
    month: { stem: '丙 Bing (Fire)', branch: '寅 Yin (Tiger)' },
    day: { stem: '甲 Jia (Wood)', branch: '子 Zi (Rat)' },
    hour: { stem: '癸 Gui (Water)', branch: '亥 Hai (Pig)' }
  },
  dayMaster: '甲 Jia Wood',
  elements: { Wood: 25, Fire: 10, Earth: 15, Metal: 20, Water: 30 }
};

const MOCK_CROSSREF = {
  harmonyScore: 78,
  reinforcing: [
    { element: 'Water', note: 'Strong in both systems - deep emotional nature' }
  ],
  balancing: [
    { element: 'Fire', note: 'Western Fire (Leo Sun) compensates for weak Bazi Fire' }
  ],
  synthesis: `Your Leo Sun brings leadership and creativity, while your Bazi reveals 
a Water-dominant nature with Wood as your core. This creates an interesting dynamic: 
you lead with warmth and confidence (Fire), but your decisions are ultimately guided 
by intuition and adaptability (Water/Wood). The Western Fire energizes your Chinese 
Wood Day Master, making you someone who can inspire others while staying true to 
your flexible, growth-oriented nature.`
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('western');
  const [showBirthForm, setShowBirthForm] = useState(true);
  const [birthData, setBirthData] = useState<any>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'western', label: 'Western Chart' },
    { key: 'bazi', label: 'Bazi' },
    { key: 'crossref', label: 'Cross-Reference' },
    { key: 'compatibility', label: 'Compatibility' },
  ];

  const handleBirthSubmit = (data: any) => {
    setBirthData(data);
    setShowBirthForm(false);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Astro Unified
          </h1>
          <nav className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button 
            onClick={() => setShowBirthForm(true)}
            className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            New Chart
          </button>
        </div>
      </header>

      {/* Birth Data Form Modal */}
      {showBirthForm && (
        <BirthDataForm 
          onSubmit={handleBirthSubmit} 
          onClose={() => birthData && setShowBirthForm(false)} 
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'western' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NatalChart data={MOCK_CHART} />
            </div>
            <div className="space-y-4">
              <DetailPanel title="Sun in Leo" house="10th House">
                <p className="text-sm text-gray-600">
                  Your core identity shines through leadership and creativity. 
                  In the 10th house, this gives you natural authority in your career.
                  You're drawn to roles where you can be seen and recognized.
                </p>
              </DetailPanel>
              <DetailPanel title="Moon in Cancer" house="9th House">
                <p className="text-sm text-gray-600">
                  Emotional security comes from exploration and philosophy. 
                  You feel nurtured by learning, travel, and expanding your worldview.
                </p>
              </DetailPanel>
              <DetailPanel title="Pattern: Grand Fire Trine">
                <p className="text-sm text-gray-600">
                  Sun, Mars, and Jupiter form a flowing triangle of fire energy.
                  This gives you natural confidence, enthusiasm, and luck in taking action.
                </p>
              </DetailPanel>
            </div>
          </div>
        )}

        {activeTab === 'bazi' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BaziPanel data={MOCK_BAZI} />
            </div>
            <div className="space-y-4">
              <DetailPanel title="Day Master: 甲 Jia Wood">
                <p className="text-sm text-gray-600">
                  You are Jia Wood - like a tall tree. You're principled, upright, 
                  and have strong growth potential. You prefer to stand tall rather 
                  than bend, and you provide shelter and support to others.
                </p>
              </DetailPanel>
              <DetailPanel title="Element Balance">
                <div className="space-y-2">
                  <ElementBar element="Wood" value={25} color="bg-wood" />
                  <ElementBar element="Fire" value={10} color="bg-fire" />
                  <ElementBar element="Earth" value={15} color="bg-earth" />
                  <ElementBar element="Metal" value={20} color="bg-metal" />
                  <ElementBar element="Water" value={30} color="bg-water" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Water dominant, Fire weak. Consider activities that boost Fire energy.
                </p>
              </DetailPanel>
            </div>
          </div>
        )}

        {activeTab === 'crossref' && (
          <CrossReference 
            western={MOCK_CHART} 
            bazi={MOCK_BAZI} 
            analysis={MOCK_CROSSREF} 
          />
        )}

        {activeTab === 'compatibility' && (
          <CompatibilityForm />
        )}
      </div>

      {/* Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Today's Transit:</span> Jupiter trine your Sun - lucky day for bold moves
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg text-sm font-medium">
            Party Mode
          </button>
        </div>
      </footer>
    </main>
  );
}

// Helper components
function DetailPanel({ title, house, children }: { title: string; house?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {house && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{house}</span>}
      </div>
      {children}
    </div>
  );
}

function ElementBar({ element, value, color }: { element: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-12 text-gray-600">{element}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{value}%</span>
    </div>
  );
}
