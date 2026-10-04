import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Clock, FastForward } from 'lucide-react';

export default function TimeSlider({ 
  timesteps, 
  currentStep, 
  onChangeStep 
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onChangeStep(prev => (prev < timesteps.length - 1 ? prev + 1 : 0));
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timesteps.length, onChangeStep]);

  const currentInfo = timesteps[currentStep] || timesteps[0];

  return (
    <div className="glass-panel time-slider-container">
      <div className="time-slider-header">
        <div className="time-badge">
          <Clock size={16} color="#38bdf8" />
          <span className="current-time-txt">{currentInfo.label}</span>
          <span className="current-lead-txt">{currentInfo.forecast_hour}</span>
          <span style={{ 
            fontSize: '0.74rem', 
            color: currentStep >= 3 ? '#ef4444' : currentStep >= 2 ? '#f97316' : '#94a3b8',
            fontWeight: 600
          }}>
            • {currentInfo.status}
          </span>
        </div>

        <div className="slider-controls">
          <button 
            className="btn-ctrl"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Forecast Evolution" : "Play Forecast Evolution"}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
          </button>

          <button 
            className="btn-ctrl"
            onClick={() => {
              setIsPlaying(false);
              onChangeStep(0);
            }}
            title="Reset to T+0 (Nowcast)"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      <div className="time-track-wrapper">
        <input 
          type="range"
          min="0"
          max={timesteps.length - 1}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            onChangeStep(parseInt(e.target.value, 10));
          }}
          className="custom-range-slider"
        />

        <div className="timeline-steps">
          {timesteps.map((step, idx) => (
            <div 
              key={step.step}
              className={`step-marker ${idx === currentStep ? 'active' : ''}`}
              onClick={() => {
                setIsPlaying(false);
                onChangeStep(idx);
              }}
            >
              <div className="step-dot" style={{
                background: idx === currentStep ? (idx >= 3 ? '#ef4444' : idx >= 2 ? '#f97316' : '#38bdf8') : '#475569'
              }} />
              <span className="step-time-label">{step.forecast_hour.replace(" (Nowcast)", "")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
