import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Smartphone, 
  PhoneCall, 
  MessageSquare, 
  Megaphone, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Volume2, 
  Square, 
  Cpu, 
  TowerControl as Tower, 
  Users,
  AlertTriangle
} from 'lucide-react';
import { speechService } from '../services/speechService';

export default function DisseminationModal({
  isOpen,
  onClose,
  scenarioData,
  currentStep,
  summary,
  aiAdvisory,
  useImdProtocol
}) {
  const [activeTab, setActiveTab] = useState('sms'); // 'sms' | 'ivr' | 'whatsapp' | 'sirens'
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchComplete, setDispatchComplete] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const unsubscribe = speechService.subscribe((playing) => {
      setIsAudioPlaying(playing);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      speechService.stop();
      setIsDispatching(false);
      setDispatchComplete(false);
      setDispatchProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cityName = scenarioData.cityName || scenarioData.city || 'Urban Sector';
  const districtName = scenarioData.districtName || (scenarioData.districts && scenarioData.districts[0]?.name) || cityName;
  const alertLevel = summary.highestAlert || 'Green';
  const rainRate = summary.maxRainMmHr;
  const isSevere = alertLevel === 'Red' || alertLevel === 'Orange';

  const regionalLang = aiAdvisory?.regionalLanguage || 'Hindi';
  const regionalText = aiAdvisory?.regionalTranslation || 
    `${cityName} mein bhaari baarish (${rainRate} mm/hr) ka khatra. Taleti ilaqe khali karein aur surakshit sthan par jayein.`;

  const smsTextEn = `[IMD ${alertLevel.toUpperCase()} ALERT] Extreme rain (${rainRate}mm/h) forecast over ${districtName} next 1-2h. Avoid underpasses/subways. Evacuate to higher ground. Call 112/1077 for NDRF rescue.`;
  const smsTextReg = regionalText;

  const handleSimulateDispatch = () => {
    setIsDispatching(true);
    setDispatchProgress(10);
    const interval = setInterval(() => {
      setDispatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDispatching(false);
          setDispatchComplete(true);
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  const handlePlayIvrAudio = () => {
    if (isAudioPlaying) {
      speechService.stop();
    } else {
      speechService.speak(regionalText, aiAdvisory?.regionalLangCode || 'hi-IN');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-dissemination" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="dissemination-pulse-badge">
              <Radio size={18} color="#ef4444" />
            </div>
            <div>
              <h3>Last-Mile Multi-Channel Alert Disseminator</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Simulating C-DOT Cell Broadcast & NDMA SACHET Emergency Warning Grid
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Current Alert Context Pill */}
        <div className="dissemination-status-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`alert-tag tag-${alertLevel.toLowerCase()}`}>
              {alertLevel.toUpperCase()} ALERT
            </span>
            <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>
              {cityName} &bull; Peak: {rainRate} mm/hr
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span><Users size={12} style={{ display: 'inline', marginRight: '4px' }} /> Affected Population: <b>{summary.estimatedImpactedPop}</b></span>
            <span><Tower size={12} style={{ display: 'inline', marginRight: '4px' }} /> Target BTS Towers: <b>142</b></span>
          </div>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="dissemination-tabs">
          <button 
            className={`dissemination-tab-btn ${activeTab === 'sms' ? 'active' : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            <Smartphone size={15} />
            <span>Cell Broadcast / SMS</span>
          </button>

          <button 
            className={`dissemination-tab-btn ${activeTab === 'ivr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ivr')}
          >
            <PhoneCall size={15} />
            <span>Outbound IVR Voice Call</span>
          </button>

          <button 
            className={`dissemination-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('whatsapp')}
          >
            <MessageSquare size={15} />
            <span>WhatsApp Disaster Channel</span>
          </button>

          <button 
            className={`dissemination-tab-btn ${activeTab === 'sirens' ? 'active' : ''}`}
            onClick={() => setActiveTab('sirens')}
          >
            <Megaphone size={15} />
            <span>Civil Defense Sirens</span>
          </button>
        </div>

        {/* Tab 1: Cell Broadcast & SMS */}
        {activeTab === 'sms' && (
          <div className="channel-tab-content">
            <div className="channel-details-grid">
              <div className="channel-spec">
                <span className="spec-label">Dissemination Standard:</span>
                <span className="spec-val">C-DOT 3GPP TS 23.041 Cell Broadcast Service (CBS)</span>
              </div>
              <div className="channel-spec">
                <span className="spec-label">Target Telecom LSA:</span>
                <span className="spec-val">{cityName} Urban Sector (Jio / Airtel / BSNL / Vi)</span>
              </div>
              <div className="channel-spec">
                <span className="spec-label">Broadcast Priority:</span>
                <span className="spec-val" style={{ color: '#ef4444', fontWeight: 700 }}>Priority 1 - National Emergency (Bypasses DND)</span>
              </div>
              <div className="channel-spec">
                <span className="spec-label">Handset Delivery Target:</span>
                <span className="spec-val">&lt; 10 Seconds Across Active Cells</span>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <div className="phone-mockup-wrapper">
              <div className="mobile-phone-frame">
                <div className="phone-screen">
                  <div className="phone-status-bar">
                    <span>14:02</span>
                    <span>📶 5G &bull; 92%</span>
                  </div>

                  <div className="emergency-broadcast-card">
                    <div className="broadcast-header">
                      <ShieldAlert size={16} color="#ef4444" />
                      <span>GOVERNMENT EMERGENCY ALERT</span>
                    </div>
                    <div className="broadcast-timestamp">India Meteorological Department &bull; MoES</div>
                    
                    <div className="broadcast-body-en">
                      {smsTextEn}
                    </div>

                    <div className="broadcast-body-reg">
                      <span className="lang-tag">[{regionalLang}]:</span> {smsTextReg}
                    </div>

                    <div className="broadcast-footer">
                      <span>NDMA SACHET System | Char count: {smsTextEn.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Outbound IVR Voice Call */}
        {activeTab === 'ivr' && (
          <div className="channel-tab-content">
            <div className="ivr-explanation-banner">
              <p>
                <b>Crucial for India's Last-Mile Problem:</b> Over 350M rural & semi-urban citizens in flood-prone basins cannot read English text or smartphones. An automated outbound IVR robocall rings their basic keypad phone and speaks in their native regional dialect.
              </p>
            </div>

            <div className="ivr-card">
              <div className="ivr-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PhoneCall size={18} color="#38bdf8" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                      Automated Voice Call: 1913 / 1077 (Disaster Response)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                      Language: {regionalLang} ({aiAdvisory?.regionalNativeName || 'Regional'})
                    </div>
                  </div>
                </div>

                <button 
                  className={`ivr-audio-btn ${isAudioPlaying ? 'playing' : ''}`}
                  onClick={handlePlayIvrAudio}
                >
                  {isAudioPlaying ? (
                    <>
                      <Square size={14} />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} />
                      <span>▶ Listen to IVR Call</span>
                    </>
                  )}
                </button>
              </div>

              {isAudioPlaying && (
                <div className="audio-wave-bars">
                  <span className="bar bar-1"></span>
                  <span className="bar bar-2"></span>
                  <span className="bar bar-3"></span>
                  <span className="bar bar-4"></span>
                  <span className="bar bar-5"></span>
                  <span style={{ fontSize: '0.72rem', color: '#38bdf8', marginLeft: '8px' }}>
                    Broadcasting synthesized voice via Web Speech API...
                  </span>
                </div>
              )}

              <div className="ivr-script-box">
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                  Spoken Script (Audio):
                </div>
                <div style={{ fontSize: '0.92rem', color: '#f8fafc', lineHeight: 1.6, fontWeight: 500 }}>
                  "{regionalText}"
                </div>
              </div>

              <div className="ivr-keypad-options">
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: '6px' }}>
                  Citizen Interactive Keypad Options (DTMF):
                </div>
                <div className="keypad-option-row">
                  <span className="keypad-digit">1</span>
                  <span>Press 1 to request immediate rescue boat / ambulance to your GPS location</span>
                </div>
                <div className="keypad-option-row">
                  <span className="keypad-digit">2</span>
                  <span>Press 2 to confirm you have reached a high-ground shelter safely</span>
                </div>
                <div className="keypad-option-row">
                  <span className="keypad-digit">3</span>
                  <span>Press 3 to replay this emergency weather bulletin</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Disaster Channel */}
        {activeTab === 'whatsapp' && (
          <div className="channel-tab-content">
            <div className="whatsapp-preview-box">
              <div className="whatsapp-header">
                <div className="whatsapp-avatar">IMD</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    IMD Disaster Alert &bull; Official <CheckCircle2 size={13} color="#22c55e" />
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#cbd5e1' }}>Government Meteorological Authority &bull; Verified</div>
                </div>
              </div>

              <div className="whatsapp-bubble">
                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
                  🔴 CRITICAL FLASH FLOOD & CLOUDBURST BULLETIN
                </div>
                <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45, marginBottom: '8px' }}>
                  <b>Location:</b> {districtName}, {cityName}<br/>
                  <b>Nowcast Peak Rain:</b> {rainRate} mm/hr<br/>
                  <b>Predicted Inundation Spread:</b> {summary.inundatedAreaSqKm} km²<br/>
                  <b>Action:</b> Stay indoors. Subways and low-lying railway corridors are submerged.
                </p>

                <div className="whatsapp-btn-bar">
                  <a href="#shelters" className="wa-action-btn" onClick={(e) => { e.preventDefault(); onClose(); }}>
                    📍 View Nearest Safe Relief Camp
                  </a>
                  <a href="tel:112" className="wa-action-btn wa-emergency">
                    📞 Call 112 Rescue Helpline
                  </a>
                </div>
                <div style={{ fontSize: '0.62rem', color: '#64748b', textAlign: 'right', marginTop: '4px' }}>
                  14:02 &bull; Delivered ✓✓
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Civil Defense Sirens */}
        {activeTab === 'sirens' && (
          <div className="channel-tab-content">
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
              Connected solar-powered civil defense siren network across critical low-elevation river basins & stormwater outfalls:
            </div>

            <div className="sirens-grid">
              <div className="siren-card active">
                <div className="siren-status-dot online"></div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f8fafc' }}>Siren Post #01 - Basin Lower Reach</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Decibel: 135 dB &bull; Solar Battery: 98% &bull; Range: 2.5 km</div>
                <span className="siren-badge ready">READY FOR TRIGGER</span>
              </div>

              <div className="siren-card active">
                <div className="siren-status-dot online"></div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f8fafc' }}>Siren Post #02 - Railway Underpass Cluster</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Decibel: 135 dB &bull; Solar Battery: 94% &bull; Range: 2.2 km</div>
                <span className="siren-badge ready">READY FOR TRIGGER</span>
              </div>

              <div className="siren-card active">
                <div className="siren-status-dot online"></div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f8fafc' }}>Siren Post #03 - Coastal Outfall & Sluice Gate</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Decibel: 140 dB &bull; Dual Siren &bull; Range: 3.0 km</div>
                <span className="siren-badge ready">READY FOR TRIGGER</span>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar when Dispatching */}
        {isDispatching && (
          <div className="dispatch-progress-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Executing C-DOT Cell Broadcast Handshake...</span>
              <span style={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono' }}>{dispatchProgress}%</span>
            </div>
            <div className="dispatch-progress-track">
              <div className="dispatch-progress-fill" style={{ width: `${dispatchProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* Dispatch Confirmation Card */}
        {dispatchComplete && (
          <div className="dispatch-success-banner">
            <CheckCircle2 size={18} color="#22c55e" />
            <div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.82rem' }}>
                Broadcast Successfully Dispatched Across 4 Channels!
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Reached <b>{summary.estimatedImpactedPop}</b> citizens across 142 BTS towers in <b>8.4 seconds</b> (NDMA Compliance Standard: &lt;12 sec).
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Powered by <b>C-DOT Cell Broadcast</b> & <b>NDMA SACHET Protocol</b>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>

            <button 
              className="btn-disseminate-now" 
              onClick={handleSimulateDispatch}
              disabled={isDispatching}
            >
              <Send size={14} />
              <span>{isDispatching ? "Dispatching..." : `Simulate Emergency Blast (${summary.estimatedImpactedPop} Citizens)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
