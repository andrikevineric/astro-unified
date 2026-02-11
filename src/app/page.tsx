'use client';

import { useState, useEffect } from 'react';
import { NatalChart } from '@/components/NatalChart';
import { BaziPanel } from '@/components/BaziPanel';
import { CrossReference } from '@/components/CrossReference';
import { CompatibilityForm } from '@/components/CompatibilityForm';
import { BirthDataForm } from '@/components/BirthDataForm';
import { calculateWesternChart, type WesternChart } from '@/lib/western';
import { calculateBaziChart, type BaziChart } from '@/lib/bazi';
import { analyzeCrossReference, type CrossRefAnalysis } from '@/lib/crossref';

type Tab = 'western' | 'bazi' | 'crossref' | 'compatibility';

interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('western');
  const [showBirthForm, setShowBirthForm] = useState(true);
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  
  const [westernChart, setWesternChart] = useState<WesternChart | null>(null);
  const [baziChart, setBaziChart] = useState<BaziChart | null>(null);
  const [crossRef, setCrossRef] = useState<CrossRefAnalysis | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'western', label: 'Western Chart' },
    { key: 'bazi', label: 'Bazi' },
    { key: 'crossref', label: 'Cross-Reference' },
    { key: 'compatibility', label: 'Compatibility' },
  ];

  const handleBirthSubmit = (data: BirthData) => {
    setBirthData(data);
    setShowBirthForm(false);
    
    // Parse the birth date and time
    const [year, month, day] = data.birthDate.split('-').map(Number);
    const [hours, minutes] = data.birthTime.split(':').map(Number);
    const birthDateTime = new Date(year, month - 1, day, hours, minutes);
    
    // Calculate Western chart
    const western = calculateWesternChart(birthDateTime, data.latitude, data.longitude);
    setWesternChart(western);
    
    // Calculate Bazi chart
    const bazi = calculateBaziChart(birthDateTime);
    setBaziChart(bazi);
    
    // Calculate cross-reference
    const analysis = analyzeCrossReference(western, bazi);
    setCrossRef(analysis);
  };

  // Convert charts to component-friendly format
  const westernData = westernChart ? {
    sun: { sign: westernChart.sun.sign, degree: westernChart.sun.degree, minutes: westernChart.sun.minutes, retrograde: westernChart.sun.retrograde },
    moon: { sign: westernChart.moon.sign, degree: westernChart.moon.degree, minutes: westernChart.moon.minutes, retrograde: westernChart.moon.retrograde },
    rising: westernChart.rising,
    mercury: { sign: westernChart.mercury.sign, degree: westernChart.mercury.degree, minutes: westernChart.mercury.minutes, retrograde: westernChart.mercury.retrograde },
    venus: { sign: westernChart.venus.sign, degree: westernChart.venus.degree, minutes: westernChart.venus.minutes, retrograde: westernChart.venus.retrograde },
    mars: { sign: westernChart.mars.sign, degree: westernChart.mars.degree, minutes: westernChart.mars.minutes, retrograde: westernChart.mars.retrograde },
    jupiter: { sign: westernChart.jupiter.sign, degree: westernChart.jupiter.degree, minutes: westernChart.jupiter.minutes, retrograde: westernChart.jupiter.retrograde },
    saturn: { sign: westernChart.saturn.sign, degree: westernChart.saturn.degree, minutes: westernChart.saturn.minutes, retrograde: westernChart.saturn.retrograde },
    uranus: { sign: westernChart.uranus.sign, degree: westernChart.uranus.degree, minutes: westernChart.uranus.minutes, retrograde: westernChart.uranus.retrograde },
    neptune: { sign: westernChart.neptune.sign, degree: westernChart.neptune.degree, minutes: westernChart.neptune.minutes, retrograde: westernChart.neptune.retrograde },
    pluto: { sign: westernChart.pluto.sign, degree: westernChart.pluto.degree, minutes: westernChart.pluto.minutes, retrograde: westernChart.pluto.retrograde },
    patterns: westernChart.patterns,
    elements: westernChart.elements,
    aspects: westernChart.aspects
  } : null;

  const baziData = baziChart ? {
    pillars: {
      year: { stem: baziChart.year.stem, branch: baziChart.year.branch },
      month: { stem: baziChart.month.stem, branch: baziChart.month.branch },
      day: { stem: baziChart.day.stem, branch: baziChart.day.branch },
      hour: { stem: baziChart.hour.stem, branch: baziChart.hour.branch },
    },
    dayMaster: baziChart.dayMaster,
    elements: baziChart.elements
  } : null;

  const crossRefData = crossRef ? {
    harmonyScore: crossRef.harmonyScore,
    reinforcing: crossRef.reinforcing,
    balancing: crossRef.balancing,
    synthesis: crossRef.synthesis
  } : null;

  return (
    <main className="min-h-screen pb-20">
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
                disabled={!birthData && tab.key !== 'compatibility'}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
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
            {birthData ? 'New Chart' : 'Enter Birth Data'}
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
        {!birthData && activeTab !== 'compatibility' ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to Astro Unified</h2>
            <p className="text-gray-500 mb-6">Enter your birth data to generate your Western and Chinese astrology charts</p>
            <button 
              onClick={() => setShowBirthForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'western' && westernData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <NatalChart data={westernData} />
                </div>
                <div className="space-y-4">
                  <DetailPanel title={`Sun in ${westernData.sun.sign}`} badge={`${westernData.sun.degree}°`}>
                    <p className="text-sm text-gray-600">
                      Your core identity and ego expression. The Sun represents your fundamental character,
                      your will, and your conscious mind.
                    </p>
                  </DetailPanel>
                  <DetailPanel title={`Moon in ${westernData.moon.sign}`} badge={`${westernData.moon.degree}°`}>
                    <p className="text-sm text-gray-600">
                      Your emotional nature and inner self. The Moon governs your instincts, habits,
                      and how you nurture yourself and others.
                    </p>
                  </DetailPanel>
                  <DetailPanel title={`Rising: ${westernData.rising.sign}`} badge={`${westernData.rising.degree}°`}>
                    <p className="text-sm text-gray-600">
                      Your outward persona and first impressions. The Ascendant shows how you present
                      yourself to the world.
                    </p>
                  </DetailPanel>
                  {westernData.patterns.length > 0 && (
                    <DetailPanel title="Chart Patterns">
                      <div className="flex flex-wrap gap-2">
                        {westernData.patterns.map((pattern) => (
                          <span key={pattern} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </DetailPanel>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bazi' && baziData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <BaziPanel data={baziData} />
                </div>
                <div className="space-y-4">
                  <DetailPanel title={`Day Master: ${baziData.dayMaster}`}>
                    <p className="text-sm text-gray-600">
                      {getDayMasterDescription(baziChart?.dayMasterElement || 'Wood')}
                    </p>
                  </DetailPanel>
                  <DetailPanel title="Element Balance">
                    <div className="space-y-2">
                      {Object.entries(baziData.elements).map(([element, value]) => (
                        <ElementBar key={element} element={element} value={value} />
                      ))}
                    </div>
                  </DetailPanel>
                </div>
              </div>
            )}

            {activeTab === 'crossref' && westernData && baziData && crossRefData && (
              <CrossReference 
                western={westernData} 
                bazi={baziData} 
                analysis={crossRefData} 
              />
            )}

            {activeTab === 'compatibility' && (
              <CompatibilityForm />
            )}
          </>
        )}
      </div>

      {/* Bottom Bar */}
      {birthData && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="font-medium">Chart for:</span> {birthData.name || 'Anonymous'} • {birthData.birthDate} {birthData.birthTime}
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg text-sm font-medium">
              Share Chart
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}

// Helper components
function DetailPanel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {badge && <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function ElementBar({ element, value }: { element: string; value: number }) {
  const colors: Record<string, string> = {
    Wood: 'bg-green-500',
    Fire: 'bg-orange-500',
    Earth: 'bg-amber-600',
    Metal: 'bg-gray-500',
    Water: 'bg-blue-500',
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-12 text-gray-600">{element}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[element] || 'bg-gray-400'} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{value}%</span>
    </div>
  );
}

function getDayMasterDescription(element: string): string {
  const descriptions: Record<string, string> = {
    Wood: 'As a Wood Day Master, you are like a tall tree - principled, growth-oriented, benevolent, and always reaching upward. You provide shelter and support to those around you.',
    Fire: 'As a Fire Day Master, you are like a warm flame - passionate, expressive, and radiant. You bring light and enthusiasm to any situation.',
    Earth: 'As an Earth Day Master, you are like a mountain - stable, nurturing, and reliable. You provide a solid foundation for others.',
    Metal: 'As a Metal Day Master, you are like refined gold - principled, decisive, and value quality. You have high standards and strong convictions.',
    Water: 'As a Water Day Master, you are like flowing water - adaptable, wise, and resourceful. You find your way around obstacles with grace.',
  };
  return descriptions[element] || 'Your Day Master represents your core self and how you interact with the world.';
}
