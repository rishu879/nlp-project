import React, { useState } from 'react';
import { 
  CloudRain, 
  MapPin, 
  ArrowRight, 
  Loader2, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Wind, 
  Mountain,
  Compass,
  ShieldAlert
} from 'lucide-react';
import { searchGlobalCities } from '../services/liveWeatherService';

export default function IntroLanding({ 
  geoStatus, 
  liveScenario, 
  onLaunchLive, 
  onLaunchBengaluru,
  onLaunchDemo, 
  onSelectCityCoords 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      const res = await searchGlobalCities(val);
      setSearchResults(res);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const currentCond = liveScenario?.currentConditions;

  return (
    <div className="modal-overlay">
      <div className="intro-modal-card">
        <div className="intro-badge">
          Smart India Hackathon 2026 | Problem Statement ID: 26071
        </div>

        <h1 className="intro-title">
          AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System
        </h1>

        <p className="intro-desc">
          Fusing real-time weather feeds, high-resolution topography, and spatiotemporal 
          nowcasting to predict localized extreme precipitation and urban inundation risk.
        </p>

        {/* Live Geolocation Detection Box */}
        <div className="geo-detection-box">
          {geoStatus === 'detecting' && (
            <div className="geo-detecting-spinner">
              <Loader2 className="spinner-icon" size={20} />
              <span>Detecting your location via browser GPS & fetching live weather...</span>
            </div>
          )}

          {geoStatus === 'success' && liveScenario && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 600, fontSize: '0.86rem' }}>
                  <MapPin size={16} />
                  <span>Live Location Detected: <b>{liveScenario.city}</b></span>
                </div>
                <span className="mode-badge live-mode" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  <span className="live-pulse-dot" style={{ width: '6px', height: '6px' }} />
                  REAL OPEN-METEO DATA
                </span>
              </div>

              {/* Current live conditions snapshot */}
              {currentCond && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
                  gap: '6px', 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '8px 10px', 
                  borderRadius: '6px',
                  fontSize: '0.74rem'
                }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Temperature</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      {currentCond.temperature_c} °C
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Humidity</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      {currentCond.humidity_pct} %
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Rainfall</div>
                    <div style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      {currentCond.precipitation_mm} mm/h
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Pressure</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      {currentCond.surface_pressure_hpa} hPa
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.65rem' }}>Elevation</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      {currentCond.base_elevation_m} m
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                Next 6-Hour Precipitation Forecast: <b>{liveScenario.timesteps[0]?.status}</b>
              </div>
            </div>
          )}

          {(geoStatus === 'denied' || geoStatus === 'error') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '0.82rem', marginBottom: '8px' }}>
                <AlertCircle size={16} />
                <span>Location access was not granted or unavailable. Search any city manually below:</span>
              </div>

              {/* Manual City Search */}
              <div style={{ position: 'relative' }}>
                <div className="search-input-wrapper" style={{ width: '100%', padding: '6px 12px' }}>
                  <Search size={14} color="#94a3b8" />
                  <input 
                    type="text"
                    className="search-input"
                    placeholder="Search city e.g. Delhi, Bengaluru, Kolkata, Chennai, Pune..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  {isSearching && <Loader2 className="spinner-icon" size={14} color="#38bdf8" />}
                </div>

                {searchResults.length > 0 && (
                  <div className="search-results-dropdown" style={{ width: '100%', top: '38px' }}>
                    {searchResults.map((city, idx) => (
                      <div 
                        key={idx}
                        className="search-result-item"
                        onClick={() => {
                          onSelectCityCoords(city.lat, city.lon, city.displayName);
                          setSearchResults([]);
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{city.name}</span>
                        <span className="search-result-sub">{city.displayName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {geoStatus === 'success' && (
            <button className="btn-launch" onClick={onLaunchLive}>
              <MapPin size={17} />
              <span>Launch Live Dashboard for My Location</span>
              <ArrowRight size={17} />
            </button>
          )}

          <button 
            className={geoStatus === 'success' ? "btn-secondary" : "btn-launch"} 
            onClick={onLaunchDemo}
          >
            <Compass size={17} />
            <span>Launch Pre-Built Mumbai Deluge Demo (SIH Scenario)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
