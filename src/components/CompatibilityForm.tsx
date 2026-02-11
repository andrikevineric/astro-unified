'use client';

import { useState } from 'react';

interface PersonData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

const MOCK_RESULT = {
  overall: 78,
  western: {
    emotional: 92,
    attraction: 70,
    communication: 65,
    longevity: 80
  },
  bazi: {
    dayMaster: 78,
    branches: 85,
    elements: 60
  },
  strengths: [
    'Deep emotional understanding (Moon trine Moon)',
    'Strong physical chemistry (Venus conjunct Mars)',
    'Branch combination 寅亥合 adds natural harmony'
  ],
  challenges: [
    'Communication styles differ (Mercury square Mercury)',
    'Both lack Earth element - remember to stay grounded'
  ],
  funSummary: "You two are like fire and wind — you make each other more intense! Just make sure you don't burn down the house. Great for adventures, just build in some chill time."
};

export function CompatibilityForm() {
  const [personA, setPersonA] = useState<PersonData>({ name: '', birthDate: '', birthTime: '', birthPlace: '' });
  const [personB, setPersonB] = useState<PersonData>({ name: '', birthDate: '', birthTime: '', birthPlace: '' });
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);

  const handleCompare = () => {
    // In production, this would call the API
    setResult(MOCK_RESULT);
  };

  const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-gray-600">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-sm font-medium">{value}%</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Input Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person A */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-purple-600 mb-4">Person A</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={personA.name}
              onChange={(e) => setPersonA({ ...personA, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={personA.birthDate}
              onChange={(e) => setPersonA({ ...personA, birthDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="time"
              value={personA.birthTime}
              onChange={(e) => setPersonA({ ...personA, birthTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Birth City"
              value={personA.birthPlace}
              onChange={(e) => setPersonA({ ...personA, birthPlace: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Person B */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-blue-600 mb-4">Person B</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={personB.name}
              onChange={(e) => setPersonB({ ...personB, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={personB.birthDate}
              onChange={(e) => setPersonB({ ...personB, birthDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={personB.birthTime}
              onChange={(e) => setPersonB({ ...personB, birthTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Birth City"
              value={personB.birthPlace}
              onChange={(e) => setPersonB({ ...personB, birthPlace: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCompare}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
      >
        Compare Compatibility
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 text-center">
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {result.overall}%
            </div>
            <div className="text-gray-600">Overall Compatibility</div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Western Synastry */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-purple-600 mb-4">Western Synastry</h3>
              <div className="space-y-3">
                <ScoreBar label="Emotional" value={result.western.emotional} color="bg-pink-500" />
                <ScoreBar label="Attraction" value={result.western.attraction} color="bg-red-500" />
                <ScoreBar label="Communication" value={result.western.communication} color="bg-yellow-500" />
                <ScoreBar label="Longevity" value={result.western.longevity} color="bg-green-500" />
              </div>
            </div>

            {/* Bazi Harmony */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-green-600 mb-4">Bazi Harmony</h3>
              <div className="space-y-3">
                <ScoreBar label="Day Masters" value={result.bazi.dayMaster} color="bg-emerald-500" />
                <ScoreBar label="Branches" value={result.bazi.branches} color="bg-teal-500" />
                <ScoreBar label="Elements" value={result.bazi.elements} color="bg-cyan-500" />
              </div>
            </div>
          </div>

          {/* Strengths & Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-green-600 mb-4">💪 Strengths</h3>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-orange-600 mb-4">⚠️ Watch Out For</h3>
              <ul className="space-y-2">
                {result.challenges.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-500">!</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fun Summary */}
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-6 border border-pink-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🎉 Party Mode Summary
            </h3>
            <p className="text-gray-700 italic text-lg">"{result.funSummary}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
