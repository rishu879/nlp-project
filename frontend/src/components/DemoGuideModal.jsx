import React from 'react';
import { X, Play, ArrowRight, ShieldAlert, Layers, Database, CheckCircle2 } from 'lucide-react';

export default function DemoGuideModal({ 
  isOpen, 
  onClose, 
  onJumpToStep,
  onOpenDataSources 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Play size={18} color="#38bdf8" />
            <h3>SIH 2026 Judge Demo Script & Flow</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            Follow this 4-step sequence to demonstrate the core value proposition of our fused AI early warning system to the hackathon evaluation jury:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Step 1 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.85rem' }}>
                  Screen 1: Baseline Normal Conditions (T+0)
                </span>
                <button 
                  style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#22c55e', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { onJumpToStep(0); onClose(); }}
                >
                  Jump to T+0
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Show baseline conditions across Mumbai. All AWS stations report normal readings (8–14 mm/hr), IMD alert is <b>GREEN</b>, and low-elevation basins (Mithi River, Hindmata, Subways) are clear with zero inundation.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#eab308', fontSize: '0.85rem' }}>
                  Screen 2: Convective Storm Inflow (T+1 to T+2)
                </span>
                <button 
                  style={{ background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#eab308', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { onJumpToStep(2); onClose(); }}
                >
                  Jump to T+2
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Slide to T+1 and T+2. Intense squall lines make landfall. Rain rates surge to 70–90 mm/hr. IMD alert automatically elevates to <b>YELLOW & ORANGE</b>. Lead time indicator shows <i>"Critical deluge expected in 1 hour"</i> giving municipal pumps advance notice.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.85rem' }}>
                  Screen 3: Cloudburst Deluge & Inundation Peaking (T+3)
                </span>
                <button 
                  style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { onJumpToStep(3); onClose(); }}
                >
                  Jump to T+3
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                The "Money Shot": Rain exceeds <b>140 mm/hr</b> over Kurla-Santacruz. Pulsing <b>RED ALERT</b> banner triggers. Low-lying Mithi basin and underpass subways glow red with &gt;1.8m calculated flood depth. Action bulletin advises closing subways and diverting suburban railway traffic.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem' }}>
                  Screen 4: Multi-Sensor Architecture & Skill Scores
                </span>
                <button 
                  style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '3px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { onClose(); onOpenDataSources(); }}
                >
                  View Architecture
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Toggle the Doppler Radar (dBZ) and Satellite IR (Brightness Temp) layers on the map. Open the Data Sources panel to show judges the 5-source heterogeneous pipeline and meteorological verification skill scores (POD 89.2%, FAR 13.8%, CSI 78.1%).
              </p>
            </div>

            {/* Step 5: Vision, Scalability & Global Impact (Pitch Script) */}
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.85rem' }}>
                    Screen 5: Vision, Cross-Border Basins & UN "Early Warnings for All"
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  Pitch Closer
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '8px' }}>
                <b>Closing Slide Talking Points for Judges:</b>
              </p>
              <ul style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: 1.5, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <li>
                  <b style={{ color: '#e2e8f0' }}>Cross-Border River Basin Scalability:</b> India shares major flood-prone river systems with its neighbors — the <i>Ganges-Brahmaputra-Meghna basin</i> spans India, Nepal, Bhutan, and Bangladesh. Floods don't stop at borders. Our modular AI architecture built for India is directly extensible downstream without altering core ML code.
                </li>
                <li>
                  <b style={{ color: '#e2e8f0' }}>UN "Early Warnings for All" (EW4All) 2027:</b> Positions our platform as a modular contribution to the UN/WMO initiative ensuring every citizen on Earth is protected by hazard early warnings by 2027.
                </li>
                <li>
                  <b style={{ color: '#e2e8f0' }}>Proving Scalability Live:</b> Flip the <i>"IMD India SOP / WMO Global"</i> toggle in the navbar to show the jury that the exact same multi-sensor rule engine and LLM advisory layer instantly adapts to international meteorological standards.
                </li>
                <li>
                  <b style={{ color: '#e2e8f0' }}>UN SDG Alignment:</b> Directly fulfills <b>SDG 13</b> (Climate Action), <b>SDG 11</b> (Sustainable Cities & Resilient Communities), and <b>SDG 3</b> (Health & Life Protection).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
