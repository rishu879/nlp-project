import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Languages, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ShieldAlert, 
  CheckCircle2, 
  Volume2,
  Square 
} from 'lucide-react';
import { speechService } from '../services/speechService';

export default function AIAdvisoryCard({ 
  advisory, 
  alertLevel, 
  isIndia, 
  useImdProtocol 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    const unsub = speechService.subscribe(playing => setIsAudioPlaying(playing));
    return () => unsub();
  }, []);

  const handleToggleSpeech = () => {
    if (isAudioPlaying) {
      speechService.stop();
    } else {
      const textToSpeak = (advisory.regionalTranslation && isIndia) 
        ? advisory.regionalTranslation 
        : advisory.headline;
      const lang = advisory.regionalLangCode || (isIndia ? 'hi-IN' : 'en-US');
      speechService.speak(textToSpeak, lang);
    }
  };

  if (!advisory) return null;

  const alertColor = alertLevel === 'Red' ? '#ef4444' :
                     alertLevel === 'Orange' ? '#f97316' :
                     alertLevel === 'Yellow' ? '#eab308' : '#22c55e';

  return (
    <div className="glass-panel ai-advisory-card" style={{
      borderLeft: `4px solid ${alertColor}`,
      background: 'rgba(15, 23, 42, 0.92)'
    }}>
      {/* Header Line */}
      <div className="ai-advisory-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="sparkle-badge">
            <Sparkles size={14} color="#38bdf8" />
            <span>AI Interpretation Layer</span>
          </div>

          <span className="ai-model-tag">
            {advisory.modelName}
          </span>

          {isIndia && advisory.regionalLanguage && (
            <span className="lang-pill">
              <Languages size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {advisory.regionalLanguage} ({advisory.regionalNativeName})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: alertColor,
            fontFamily: 'JetBrains Mono',
            letterSpacing: '0.4px'
          }}>
            {isIndia && useImdProtocol ? "IMD SOP WARNING" : "WMO GLOBAL PROTOCOL"}
          </span>

          <button 
            className={`voice-listen-pill ${isAudioPlaying ? 'active' : ''}`}
            onClick={handleToggleSpeech}
            title="Listen to emergency advisory read aloud"
          >
            {isAudioPlaying ? <Square size={12} color="#ef4444" /> : <Volume2 size={12} color="#38bdf8" />}
            <span>{isAudioPlaying ? "Stop Voice" : "🔊 Listen"}</span>
            {isAudioPlaying && (
              <span className="mini-sound-wave">
                <span className="mini-bar"></span>
                <span className="mini-bar"></span>
                <span className="mini-bar"></span>
              </span>
            )}
          </button>

          <button 
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Toggle Detailed Civic Guidance"
          >
            <span style={{ fontSize: '0.72rem' }}>What this means for you</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Main Plain-Language Headlines */}
      <div className="ai-advisory-body">
        <div className="ai-headline-en">
          {advisory.headline}
        </div>

        {advisory.regionalTranslation && (
          <div className="ai-headline-regional">
            <span style={{ opacity: 0.7, fontSize: '0.72rem', textTransform: 'uppercase', marginRight: '6px' }}>
              [{advisory.regionalNativeName}]:
            </span>
            {advisory.regionalTranslation}
          </div>
        )}

        {/* Expandable "What this means for you" list */}
        {isExpanded && (
          <div className="what-this-means-drawer">
            <div style={{ fontWeight: 700, fontSize: '0.76rem', color: '#f8fafc', marginBottom: '6px' }}>
              Actionable Public & Municipal Guidance:
            </div>
            <ul className="guidance-list">
              {advisory.whatThisMeans?.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Transparency Caption */}
      <div className="ai-advisory-footer">
        <Info size={11} color="#94a3b8" />
        <span>
          <b>Judge Note:</b> The LLM does NOT simulate meteorological numbers. It operates purely as a civic interpretation & multi-lingual synthesis layer over raw NWP forecast matrices.
        </span>
      </div>
    </div>
  );
}
