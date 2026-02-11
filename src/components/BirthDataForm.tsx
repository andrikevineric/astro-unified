'use client';

import { useState } from 'react';

interface BirthDataFormProps {
  onSubmit: (data: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
  }) => void;
  onClose: () => void;
}

// Common cities with coordinates
const CITIES: Record<string, { lat: number; lng: number }> = {
  'New York, USA': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles, USA': { lat: 34.0522, lng: -118.2437 },
  'Chicago, USA': { lat: 41.8781, lng: -87.6298 },
  'London, UK': { lat: 51.5074, lng: -0.1278 },
  'Paris, France': { lat: 48.8566, lng: 2.3522 },
  'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
  'Beijing, China': { lat: 39.9042, lng: 116.4074 },
  'Shanghai, China': { lat: 31.2304, lng: 121.4737 },
  'Hong Kong': { lat: 22.3193, lng: 114.1694 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Sydney, Australia': { lat: -33.8688, lng: 151.2093 },
  'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
  'Dubai, UAE': { lat: 25.2048, lng: 55.2708 },
  'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456 },
  'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018 },
  'Seoul, South Korea': { lat: 37.5665, lng: 126.9780 },
  'Toronto, Canada': { lat: 43.6532, lng: -79.3832 },
  'Berlin, Germany': { lat: 52.5200, lng: 13.4050 },
  'Moscow, Russia': { lat: 55.7558, lng: 37.6173 },
  'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333 },
  'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332 },
  'Cairo, Egypt': { lat: 30.0444, lng: 31.2357 },
  'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792 },
  'Manila, Philippines': { lat: 14.5995, lng: 120.9842 },
  'Kuala Lumpur, Malaysia': { lat: 3.1390, lng: 101.6869 },
};

export function BirthDataForm({ onSubmit, onClose }: BirthDataFormProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthPlace, setBirthPlace] = useState('');
  const [customCoords, setCustomCoords] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [unknownTime, setUnknownTime] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handlePlaceChange = (value: string) => {
    setBirthPlace(value);
    
    // Show matching suggestions
    if (value.length > 1) {
      const matches = Object.keys(CITIES).filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const selectCity = (city: string) => {
    setBirthPlace(city);
    setSuggestions([]);
    setCustomCoords(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let lat: number, lng: number;
    
    if (customCoords) {
      lat = parseFloat(latitude);
      lng = parseFloat(longitude);
    } else {
      const coords = CITIES[birthPlace];
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      } else {
        // Default to Greenwich if city not found
        lat = 51.4772;
        lng = 0;
      }
    }
    
    onSubmit({
      name,
      birthDate,
      birthTime: unknownTime ? '12:00' : birthTime,
      birthPlace,
      latitude: lat,
      longitude: lng,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <h2 className="text-xl font-semibold">Enter Birth Details</h2>
          <p className="text-purple-100 text-sm mt-1">
            For accurate Western chart and Bazi calculation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Time
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              disabled={unknownTime}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            />
            <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={unknownTime}
                onChange={(e) => setUnknownTime(e.target.checked)}
                className="rounded"
              />
              I don&apos;t know my birth time (will use noon)
            </label>
            {unknownTime && (
              <p className="text-xs text-orange-600 mt-1">
                Note: Rising sign and hour pillar will be approximate.
              </p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={birthPlace}
              onChange={(e) => handlePlaceChange(e.target.value)}
              placeholder="e.g., New York, USA"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {suggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full px-4 py-2 text-left hover:bg-purple-50 text-sm"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Select from suggestions or enter custom coordinates below
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={customCoords}
                onChange={(e) => setCustomCoords(e.target.checked)}
                className="rounded"
              />
              Enter custom coordinates
            </label>
            
            {customCoords && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., 40.7128"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., -74.0060"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600"
            >
              Generate Chart
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
            <strong>Privacy:</strong> Your birth data is processed in your browser and not sent to any server.
            All calculations happen locally.
          </div>
        </div>
      </div>
    </div>
  );
}
