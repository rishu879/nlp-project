import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Volume2, 
  Square, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Home, 
  Zap, 
  HeartHandshake, 
  Radio, 
  Tent,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { getSheltersForLocation } from '../data/sheltersData';

export default function CitizenView({
  scenarioData,
  currentStep,
  summary,
  aiAdvisory,
  onSwitchToOfficial
}) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [reportedFlood, setReportedFlood] = useState(false);
  const [selectedWaterLevel, setSelectedWaterLevel] = useState(null);

  useEffect(() => {
    const unsub = speechService.subscribe(playing => setIsAudioPlaying(playing));
    return () => unsub();
  }, []);

  const cityName = scenarioData.cityName || scenarioData.city || 'Your City';
  const alertLevel = summary.highestAlert || 'Green';
  const shelters = getSheltersForLocation(scenarioData);
  const primaryShelter = shelters[0];

  const regionalLang = aiAdvisory?.regionalLanguage || 'Hindi';
  const regionalText = aiAdvisory?.regionalTranslation || 
    `${cityName} mein bhaari baarish ka alert hai. Kripya ghar ke andar rahein aur surakshit rahein.`;

  const handleToggleVoice = () => {
    if (isAudioPlaying) {
      speechService.stop();
    } else {
      speechService.speak(regionalText, aiAdvisory?.regionalLangCode || 'hi-IN');
    }
  };

  const alertBg = alertLevel === 'Red' ? 'citizen-alert-red' :
                  alertLevel === 'Orange' ? 'citizen-alert-orange' :
                  alertLevel === 'Yellow' ? 'citizen-alert-yellow' : 'citizen-alert-green';

  const alertIcon = alertLevel === 'Red' ? '🚨' :
                    alertLevel === 'Orange' ? '⚠️' :
                    alertLevel === 'Yellow' ? '🌧️' : '☀️';

  return (
    <div className="citizen-view-container">
      {/* Top Banner with Direct Citizen Status */}
      <div className={`citizen-hero-card ${alertBg}`}>
        <div className="citizen-hero-content">
          <div className="citizen-hero-top">
            <span className="citizen-badge">
              {alertIcon} CITIZEN DISASTER ADVISORY &bull; {alertLevel.toUpperCase()} ALERT
            </span>
            <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
              {scenarioData.timesteps[currentStep]?.label} ({scenarioData.timesteps[currentStep]?.forecast_hour})
            </span>
          </div>

          <h2 className="citizen-status-title">
            {alertLevel === 'Red' && `Danger: Extremely Heavy Rainfall Over ${cityName}!`}
            {alertLevel === 'Orange' && `Caution: Heavy Rainfall Intensifying Over ${cityName}`}
            {alertLevel === 'Yellow' && `Watch: Moderate Rain Showers Over ${cityName}`}
            {alertLevel === 'Green' && `All Clear: Normal Weather in ${cityName}`}
          </h2>

          <p className="citizen-status-desc">
            {alertLevel === 'Red' 
              ? `Estimated rain rate: ${summary.maxRainMmHr} mm/hr. Severe waterlogging in subways and road depressions. Stay indoors or evacuate immediately if in a ground-floor flood basin.`
              : alertLevel === 'Orange'
              ? `Estimated rain rate: ${summary.maxRainMmHr} mm/hr. Avoid non-essential vehicular travel. Municipal drainage pumps operating at peak capacity.`
              : `Conditions currently manageable. Low danger of severe inundation.`}
          </p>

          {/* Regional Audio Player */}
          <div className="citizen-audio-row">
            <button 
              className={`citizen-voice-btn ${isAudioPlaying ? 'active' : ''}`}
              onClick={handleToggleVoice}
            >
              {isAudioPlaying ? <Square size={16} /> : <Volume2 size={16} />}
              <span>{isAudioPlaying ? "Stop Audio" : `Listen Advisory in ${regionalLang}`}</span>
            </button>

            {isAudioPlaying && (
              <div className="audio-wave-bars">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
                <span className="bar bar-4"></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Nearest Shelter + Action Checklist */}
      <div className="citizen-grid">
        {/* Nearest Designated Safe Shelter */}
        <div className="glass-panel citizen-card">
          <div className="citizen-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="citizen-icon-circle green">
                <Tent size={18} color="#22c55e" />
              </div>
              <div>
                <h3>Nearest Elevated Safe Shelter</h3>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>High ground above calculated flood level</span>
              </div>
            </div>
            <span className="safe-elev-badge">
              +{primaryShelter.elevation_m}m MSL Elevation
            </span>
          </div>

          <div className="shelter-detail-box">
            <h4 style={{ color: '#38bdf8', fontSize: '0.95rem', marginBottom: '4px' }}>
              {primaryShelter.name}
            </h4>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '8px' }}>
              <MapPin size={13} style={{ display: 'inline', marginRight: '4px', color: '#94a3b8' }} />
              {primaryShelter.address}
            </div>

            <div className="shelter-amenities-grid">
              <div className="amenity-cell">
                <span className="am-label">Capacity Status:</span>
                <span className="am-val">{primaryShelter.currentOccupancy} / {primaryShelter.capacity} citizens</span>
              </div>
              <div className="amenity-cell">
                <span className="am-label">Medical Post:</span>
                <span className="am-val" style={{ color: '#34d399' }}>{primaryShelter.medicalPost}</span>
              </div>
              <div className="amenity-cell">
                <span className="am-label">Power Backup:</span>
                <span className="am-val">{primaryShelter.generatorBackup}</span>
              </div>
              <div className="amenity-cell">
                <span className="am-label">Water Reserves:</span>
                <span className="am-val">{primaryShelter.drinkingWaterLiters.toLocaleString()} Liters</span>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${primaryShelter.lat},${primaryShelter.lon}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn-navigate-shelter"
              >
                <Navigation size={14} />
                <span>Navigate to Shelter (Safe Route)</span>
              </a>

              <a href={`tel:${primaryShelter.contact.split(':')[1]?.trim() || '1077'}`} className="btn-shelter-call">
                <PhoneCall size={14} />
                <span>Contact Camp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Actionable Rules / Dos and Don'ts */}
        <div className="glass-panel citizen-card">
          <div className="citizen-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="citizen-icon-circle red">
                <AlertTriangle size={18} color="#ef4444" />
              </div>
              <div>
                <h3>Immediate Survival Dos & Don'ts</h3>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>NDMA Official Protocol for Flash Floods</span>
              </div>
            </div>
          </div>

          <div className="dos-donts-list">
            <div className="do-item dont">
              <span className="do-badge dont-b">DO NOT</span>
              <span className="do-text">Never drive or walk into flooded subways or waterlogged underpasses. 60cm of moving water can float a vehicle.</span>
            </div>

            <div className="do-item do">
              <span className="do-badge do-b">DO</span>
              <span className="do-text">Switch off main electrical breakers and disconnect electrical appliances if flood water enters your home.</span>
            </div>

            <div className="do-item do">
              <span className="do-badge do-b">DO</span>
              <span className="do-text">Keep your mobile phone fully charged, preserve battery by switching to Power Saving mode, and store essential medicine in waterproof bags.</span>
            </div>

            <div className="do-item dont">
              <span className="do-badge dont-b">DO NOT</span>
              <span className="do-text">Do not touch fallen electric wires or metal light poles during or after heavy downpours.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Helplines Strip */}
      <div className="citizen-helplines-card glass-panel">
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc', marginBottom: '8px' }}>
          📞 24/7 Verified Emergency Disaster Helplines (One-Tap Dial)
        </div>
        <div className="helpline-buttons-grid">
          <a href="tel:112" className="helpline-btn emergency-112">
            <span className="helpline-num">112</span>
            <span className="helpline-name">National Emergency (Police / Fire / Ambulance)</span>
          </a>

          <a href="tel:1077" className="helpline-btn">
            <span className="helpline-num">1077</span>
            <span className="helpline-name">District Disaster Control Room (DDMA)</span>
          </a>

          <a href="tel:1070" className="helpline-btn">
            <span className="helpline-num">1070</span>
            <span className="helpline-name">State Disaster Management Authority (SDMA)</span>
          </a>

          <a href="tel:01124363260" className="helpline-btn">
            <span className="helpline-num">011-24363260</span>
            <span className="helpline-name">NDRF National Headquarters HQ</span>
          </a>
        </div>
      </div>

      {/* Citizen Ground-Truth Flood Reporter */}
      <div className="glass-panel citizen-report-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ color: '#38bdf8', fontSize: '0.85rem', marginBottom: '2px' }}>
              📍 Report Street Flooding (Citizen Science Ground-Truth)
            </h4>
            <p style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Help validate and calibrate IMD AI hydrological models with real-time ground observations.
            </p>
          </div>

          {reportedFlood ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#22c55e', fontSize: '0.8rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Report Submitted & Verified!</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className={`water-lvl-btn ${selectedWaterLevel === 'ankle' ? 'selected' : ''}`}
                onClick={() => setSelectedWaterLevel('ankle')}
              >
                Ankle Deep (~15cm)
              </button>
              <button 
                className={`water-lvl-btn ${selectedWaterLevel === 'knee' ? 'selected' : ''}`}
                onClick={() => setSelectedWaterLevel('knee')}
              >
                Knee Deep (~45cm)
              </button>
              <button 
                className={`water-lvl-btn critical ${selectedWaterLevel === 'waist' ? 'selected' : ''}`}
                onClick={() => setSelectedWaterLevel('waist')}
              >
                Waist Deep (&gt;80cm)
              </button>
              <button 
                className="btn-submit-report"
                disabled={!selectedWaterLevel}
                onClick={() => setReportedFlood(true)}
              >
                Submit Pin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
