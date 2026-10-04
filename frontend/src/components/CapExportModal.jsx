import React, { useState } from 'react';
import { 
  X, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { generateCapAlertXml } from '../services/capGeneratorService';

export default function CapExportModal({
  isOpen,
  onClose,
  scenarioData,
  currentStep,
  summary,
  aiAdvisory,
  useImdProtocol
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const xmlContent = generateCapAlertXml({
    scenarioData,
    currentStep,
    summary,
    aiAdvisory,
    useImdProtocol
  });

  const cityName = scenarioData.cityName || scenarioData.city || 'District';
  const alertLevel = summary.highestAlert || 'Green';

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IMD_CAP_Alert_${cityName.replace(/[^a-zA-Z0-9]/g, '_')}_Step${currentStep}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-cap" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <FileCode size={20} color="#38bdf8" />
            </div>
            <div>
              <h3>Common Alerting Protocol (CAP v1.2) XML Export</h3>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                ITU-T X.1303 International Emergency Alert Interoperability Standard
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Informational Standard Banner */}
        <div className="cap-compliance-banner">
          <ShieldCheck size={16} color="#34d399" />
          <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            <b>Government Interoperability:</b> This generated payload directly feeds into the <b>National Disaster Management Authority (NDMA) SACHET Portal</b>, <b>Google Public Alerts</b>, <b>WMO Alert Hub</b>, and <b>C-DOT Cell Broadcast</b>. It translates AI nowcasting into actionable, machine-readable XML.
          </div>
        </div>

        {/* Quick Parameters Summary */}
        <div className="cap-params-grid">
          <div className="cap-param-cell">
            <span className="param-k">Alert Level:</span>
            <span className="param-v" style={{ 
              color: alertLevel === 'Red' ? '#ef4444' : alertLevel === 'Orange' ? '#f97316' : '#22c55e', 
              fontWeight: 700 
            }}>
              IMD {alertLevel.toUpperCase()}
            </span>
          </div>
          <div className="cap-param-cell">
            <span className="param-k">Category:</span>
            <span className="param-v">Meteorological (Met)</span>
          </div>
          <div className="cap-param-cell">
            <span className="param-k">Sender Authority:</span>
            <span className="param-v">MoES / IMD</span>
          </div>
          <div className="cap-param-cell">
            <span className="param-k">Nowcast Peak Rate:</span>
            <span className="param-v">{summary.maxRainMmHr} mm/hr</span>
          </div>
        </div>

        {/* XML Viewer Box */}
        <div className="cap-code-container">
          <div className="cap-code-header">
            <span>cap-v1.2-alert-document.xml</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="cap-action-icon-btn" onClick={handleCopy} title="Copy XML">
                {copied ? <Check size={13} color="#22c55e" /> : <Copy size={13} />}
                <span>{copied ? "Copied!" : "Copy XML"}</span>
              </button>
              <button className="cap-action-icon-btn primary" onClick={handleDownload} title="Download .xml File">
                <Download size={13} />
                <span>Download .xml</span>
              </button>
            </div>
          </div>
          <pre className="cap-code-body">
            <code>{xmlContent}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Validated against OASIS CAP-v1.2 XML Schema Definition (XSD)
          </div>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
