import React, { useState } from 'react';
import { 
  CloudRain, 
  HelpCircle, 
  ShieldAlert, 
  Database,
  Search, 
  Loader2, 
  Globe2, 
  ExternalLink,
  SlidersHorizontal,
  Radio,
  FileCode,
  Shield,
  Users
} from 'lucide-react';
import { searchGlobalCities } from '../services/liveWeatherService';

export default function Navbar({ 
  activeMode, 
  liveLocationName,
  geoInfo,
  useImdProtocol,
  onToggleProtocol,
  onSelectMode, 
  onSelectCityCoords,
  onOpenDataSources, 
  onOpenDemoGuide,
  highestAlert,
  userRole = 'official',
  onToggleRole,
  onOpenDissemination,
  onOpenCapExport
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

  const isLive = activeMode === 'live';
  const isIndia = geoInfo?.isIndia || activeMode === 'bengaluru' || activeMode === 'mumbai' || activeMode === 'chennai';

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-badge">
          {isIndia && useImdProtocol ? "MoES / IMD" : "WMO HYDRO"}
        </div>
        <div className="brand-text">
          <h1>
            <CloudRain size={19} color="#38bdf8" />
            AI/ML Heavy Rainfall & Inundation Early Warning System
          </h1>
          <p>
            {isIndia && useImdProtocol ? (
              <span>
                Standard Operating Procedure (SOP) | Authorized Source: <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>mausam.imd.gov.in</a>
              </span>
            ) : (
              <span>WMO Multi-Hazard Early Warning Framework (International View)</span>
            )}
          </p>
        </div>
      </div>

      <div className="navbar-actions">
        {/* City Autocomplete Search Box */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={13} color="#94a3b8" />
            <input 
              type="text"
              className="search-input"
              placeholder="Search city (e.g. Bengaluru, Mumbai)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && <Loader2 className="spinner-icon" size={13} color="#38bdf8" />}
          </div>

          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((city, idx) => (
                <div 
                  key={idx}
                  className="search-result-item"
                  onClick={() => {
                    onSelectCityCoords(city.lat, city.lon, city.displayName);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{city.name}</span>
                  <span className="search-result-sub">{city.displayName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mode / Scenario Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select 
            className="scenario-select"
            value={activeMode}
            onChange={(e) => onSelectMode(e.target.value)}
          >
            <option value="live">📍 Live: {liveLocationName || "Detecting GPS..."}</option>
            <option value="bengaluru">🚨 Bengaluru (2022 Deluge - Real Data)</option>
            <option value="mumbai">⛈️ Mumbai (Simulated Deluge Demo)</option>
            <option value="chennai">🌀 Chennai (Simulated Cyclone Demo)</option>
          </select>
        </div>

        {/* Protocol Toggle (IMD SOP vs WMO Global) */}
        <button 
          className="protocol-toggle-btn"
          onClick={onToggleProtocol}
          title="Toggle between Indian IMD SOP thresholds and International WMO guidelines"
        >
          <SlidersHorizontal size={13} />
          <span>{useImdProtocol ? "IMD India SOP" : "WMO Global"}</span>
        </button>

        {/* Mode Transparency Badge (Live vs Simulated) */}
        {isLive ? (
          <div className="mode-badge live-mode" title="Live meteorological telemetry fetched via Open-Meteo Global NWP">
            <span className="live-pulse-dot" />
            <span>LIVE DATA</span>
          </div>
        ) : (
          <div className="mode-badge sim-mode" title="Pre-loaded monsoon cloudburst simulation for hackathon demo">
            <span>SIMULATED SCENARIO</span>
          </div>
        )}

        {/* Live IMD Alert Pill */}
        <div className="glass-pill" style={{ 
          padding: '4px 10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          borderColor: highestAlert === 'Red' ? 'rgba(239, 68, 68, 0.5)' : 
                       highestAlert === 'Orange' ? 'rgba(249, 115, 22, 0.5)' : 
                       highestAlert === 'Yellow' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 197, 94, 0.5)'
        }}>
          <ShieldAlert 
            size={15} 
            color={
              highestAlert === 'Red' ? '#ef4444' : 
              highestAlert === 'Orange' ? '#f97316' : 
              highestAlert === 'Yellow' ? '#eab308' : '#22c55e'
            } 
          />
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: '700',
            color: highestAlert === 'Red' ? '#ef4444' : 
                   highestAlert === 'Orange' ? '#f97316' : 
                   highestAlert === 'Yellow' ? '#eab308' : '#22c55e'
          }}>
            {highestAlert.toUpperCase()}
          </span>
        </div>

        {/* Official vs Citizen Dual-View Role Toggle */}
        <button 
          className={`role-toggle-btn ${userRole === 'citizen' ? 'citizen-mode' : 'official-mode'}`}
          onClick={onToggleRole}
          title={userRole === 'official' ? "Switch to Citizen Safety View (Simple Guidance, Shelters & Helplines)" : "Switch to DDMA / IMD Command Center"}
        >
          {userRole === 'official' ? (
            <>
              <Shield size={13} color="#38bdf8" />
              <span>Official View</span>
            </>
          ) : (
            <>
              <Users size={13} color="#22c55e" />
              <span>Citizen View</span>
            </>
          )}
        </button>

        {/* Multi-Channel Alert Dissemination Simulator Trigger */}
        <button 
          className={`btn-nav-disseminate ${highestAlert === 'Red' ? 'pulse-red' : highestAlert === 'Orange' ? 'pulse-orange' : ''}`}
          onClick={onOpenDissemination}
          title="Last-Mile Multi-Channel Warning Engine (C-DOT Cell Broadcast, SMS, IVR Voice Call, WhatsApp)"
        >
          <Radio size={13} />
          <span>Broadcast</span>
        </button>

        {/* CAP 1.2 XML Export Button */}
        <button 
          className="btn-nav"
          onClick={onOpenCapExport}
          title="Export ITU-T X.1303 CAP 1.2 XML for NDMA SACHET / Google Public Alerts"
        >
          <FileCode size={13} color="#38bdf8" />
          <span>CAP XML</span>
        </button>

        {/* Data Sources Modal Button */}
        <button 
          className="btn-nav"
          onClick={onOpenDataSources}
          title="Inspect Multi-Sensor Fusion & AI Verification"
        >
          <Database size={14} color="#38bdf8" />
          <span>Data Sources</span>
        </button>

        {/* Demo Script Walkthrough Button */}
        <button 
          className="btn-nav active"
          onClick={onOpenDemoGuide}
          title="SIH Judge Presentation Script"
        >
          <HelpCircle size={14} />
          <span>Judge Script</span>
        </button>
      </div>
    </header>
  );
}
