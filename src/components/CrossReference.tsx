'use client';

interface CrossRefProps {
  western: any;
  bazi: any;
  analysis: {
    harmonyScore: number;
    reinforcing: Array<{ element: string; note: string }>;
    balancing: Array<{ element: string; note: string }>;
    synthesis: string;
  };
}

export function CrossReference({ western, bazi, analysis }: CrossRefProps) {
  return (
    <div className="space-y-6">
      {/* Harmony Score */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">East Meets West: Cross-Reference Analysis</h2>
        
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {analysis.harmonyScore}%
            </div>
            <div className="text-sm text-gray-500">System Harmony</div>
          </div>
          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              style={{ width: `${analysis.harmonyScore}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          This score indicates how well your Western and Chinese astrological profiles align.
          A higher score means the two systems see similar themes in your chart.
        </p>
      </div>

      {/* Side by Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Western Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-purple-600 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-lg">♌</span>
            Western Profile
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sun Sign</span>
              <span className="font-medium">{western.sun.sign}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Moon Sign</span>
              <span className="font-medium">{western.moon.sign}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rising</span>
              <span className="font-medium">{western.rising.sign}</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Dominant Element</div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-fire/20 text-fire text-xs rounded font-medium">
                  Fire {western.elements.Fire}%
                </span>
                <span className="px-2 py-1 bg-water/20 text-water text-xs rounded font-medium">
                  Water {western.elements.Water}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bazi Summary */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-lg">甲</span>
            Chinese Bazi Profile
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Day Master</span>
              <span className="font-medium">{bazi.dayMaster}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Year Branch</span>
              <span className="font-medium">{bazi.pillars.year.branch.split(' ')[1]}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Core Element</span>
              <span className="font-medium">Wood</span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Dominant Element</div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                  Water {bazi.elements.Water}%
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                  Wood {bazi.elements.Wood}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reinforcing Patterns */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-green-500">🔗</span>
          Reinforcing Patterns
          <span className="text-xs text-gray-400 font-normal">(Themes confirmed by both systems)</span>
        </h3>
        <div className="space-y-3">
          {analysis.reinforcing.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
              <div>
                <div className="font-medium text-green-800">{item.element}</div>
                <div className="text-sm text-green-700">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balancing Patterns */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-blue-500">⚖️</span>
          Balancing Patterns
          <span className="text-xs text-gray-400 font-normal">(One system compensates for the other)</span>
        </h3>
        <div className="space-y-3">
          {analysis.balancing.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">↔</span>
              <div>
                <div className="font-medium text-blue-800">{item.element}</div>
                <div className="text-sm text-blue-700">{item.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesis */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-purple-500">💫</span>
          Integrated Synthesis
        </h3>
        <p className="text-gray-700 leading-relaxed">{analysis.synthesis}</p>
      </div>

      {/* Element Mapping Reference */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Element Mapping Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-orange-50 rounded-lg text-center">
            <div className="font-medium text-orange-700">Fire ↔ Fire</div>
            <div className="text-xs text-orange-600">Aries, Leo, Sag</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <div className="font-medium text-amber-700">Earth ↔ Earth</div>
            <div className="text-xs text-amber-600">Taurus, Virgo, Cap</div>
          </div>
          <div className="p-3 bg-sky-50 rounded-lg text-center">
            <div className="font-medium text-sky-700">Air ↔ Metal/Wood</div>
            <div className="text-xs text-sky-600">Gemini, Libra, Aqua</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <div className="font-medium text-blue-700">Water ↔ Water</div>
            <div className="text-xs text-blue-600">Cancer, Scorpio, Pisces</div>
          </div>
        </div>
      </div>
    </div>
  );
}
