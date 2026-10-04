/**
 * ==============================================================================
 * COMMON ALERTING PROTOCOL (CAP v1.2 / ITU-T X.1303) EXPORT SERVICE
 * Compliant with India Meteorological Department (IMD) & NDMA SACHET Standards
 * Smart India Hackathon 2026 | Problem Statement ID: 26071
 * ==============================================================================
 */

/**
 * Maps IMD color alert level to international CAP v1.2 Severity, Urgency, Certainty
 */
function getCapAlertAttributes(alertLevel) {
  switch (alertLevel) {
    case 'Red':
      return {
        severity: 'Extreme',
        urgency: 'Immediate',
        certainty: 'Observed',
        event: 'Extremely Heavy Rainfall & Urban Flash Flood / Cloudburst',
        colorCode: 'RED',
        responseType: 'Evacuate'
      };
    case 'Orange':
      return {
        severity: 'Severe',
        urgency: 'Expected',
        certainty: 'Likely',
        event: 'Very Heavy Rainfall & Severe Inundation Threat',
        colorCode: 'ORANGE',
        responseType: 'Prepare'
      };
    case 'Yellow':
      return {
        severity: 'Moderate',
        urgency: 'Future',
        certainty: 'Possible',
        event: 'Heavy Rainfall Advisory & Localized Waterlogging Watch',
        colorCode: 'YELLOW',
        responseType: 'Monitor'
      };
    default:
      return {
        severity: 'Minor',
        urgency: 'Past',
        certainty: 'Unlikely',
        event: 'Normal Monsoon Conditions & Routine Hydro Watch',
        colorCode: 'GREEN',
        responseType: 'None'
      };
  }
}

/**
 * Generates an ITU-T X.1303 / OASIS CAP v1.2 formatted XML string
 */
export function generateCapAlertXml({
  scenarioData,
  currentStep,
  summary,
  aiAdvisory,
  useImdProtocol = true
}) {
  const timestep = scenarioData.timesteps[currentStep] || {};
  const cityName = scenarioData.cityName || scenarioData.city || 'National Operations Centre';
  const districtName = scenarioData.districtName || (scenarioData.districts && scenarioData.districts[0]?.name) || cityName;
  const alertLevel = summary.highestAlert || 'Green';
  const capAttrs = getCapAlertAttributes(alertLevel);

  const now = new Date();
  const timestampIso = now.toISOString();
  const expiresDate = new Date(now.getTime() + 6 * 3600 * 1000); // +6 hours expiry
  const expiresIso = expiresDate.toISOString();

  const alertId = `urn:oid:2.49.0.0.356.0.IMD-NOWCAST-${Date.now()}`;
  const senderId = "alert-dissemination@imd.gov.in";

  const lat = scenarioData.center?.lat || 19.076;
  const lon = scenarioData.center?.lon || 72.877;
  const radiusKm = 15.0;

  const headline = aiAdvisory?.headline || 
    `IMD ${alertLevel.toUpperCase()} ALERT: ${capAttrs.event} forecast over ${districtName} (${summary.maxRainMmHr} mm/hr)`;

  const description = `AI/ML Multi-Sensor Nowcasting Engine (ConvLSTM + XGBoost) detected extreme convective storm evolution over ${cityName}. Observed/forecast maximum precipitation rate: ${summary.maxRainMmHr} mm/hr. Estimated inundation spread: ${summary.inundatedAreaSqKm} km² using SCS-CN runoff modeling on SRTM 30m DEM slope depressions. Population in affected basin: ${summary.estimatedImpactedPop}.`;

  const instruction = alertLevel === 'Red' 
    ? 'TAKE IMMEDIATE ACTION: Move to designated higher ground shelters immediately. Avoid underpasses, subways, and low-lying coastal stormwater corridors. Keep emergency supplies and phone battery charged. Call 112 / 1077 for NDRF rescue assistance.'
    : alertLevel === 'Orange'
    ? 'BE PREPARED: Avoid non-essential road travel. Municipal storm pumps activated. Keep track of live IMD Doppler Radar bulletins and follow SDMA advisories.'
    : 'BE UPDATED: Monitor weather developments. Commuters should expect minor transit delays in water-prone road pockets.';

  const regionalText = aiAdvisory?.regionalTranslation 
    ? `\n      <parameter>\n        <valueName>RegionalVernacularAlert</valueName>\n        <value><![CDATA[${aiAdvisory.regionalTranslation}]]></value>\n      </parameter>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alertId}</identifier>
  <sender>${senderId}</sender>
  <sent>${timestampIso}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <code>IPAWS-VERSION:1.0</code>
  <code>NDMA-SACHET-STD:2026</code>
  <info>
    <language>en-IN</language>
    <category>Met</category>
    <event>${capAttrs.event}</event>
    <responseType>${capAttrs.responseType}</responseType>
    <urgency>${capAttrs.urgency}</urgency>
    <severity>${capAttrs.severity}</severity>
    <certainty>${capAttrs.certainty}</certainty>
    <eventCode>
      <valueName>IMD_COLOR_CODE</valueName>
      <value>${capAttrs.colorCode}</value>
    </eventCode>
    <eventCode>
      <valueName>SAME_WMO_CODE</valueName>
      <value>FFW</value>
    </eventCode>
    <expires>${expiresIso}</expires>
    <senderName>India Meteorological Department (MoES / IMD)</senderName>
    <headline><![CDATA[${headline}]]></headline>
    <description><![CDATA[${description}]]></description>
    <instruction><![CDATA[${instruction}]]></instruction>
    <web>https://mausam.imd.gov.in</web>
    <contact>National Disaster Management Authority (NDMA) / IMD Control Room: 1077</contact>
    <parameter>
      <valueName>PeakPrecipitationRateMmHr</valueName>
      <value>${summary.maxRainMmHr}</value>
    </parameter>
    <parameter>
      <valueName>EstimatedInundationAreaSqKm</valueName>
      <value>${summary.inundatedAreaSqKm}</value>
    </parameter>
    <parameter>
      <valueName>HydrologicalEngineModel</valueName>
      <value>SCS-CN Runoff (Urban CN=88) + SRTM 30m DEM</value>
    </parameter>
    <parameter>
      <valueName>LeadTimeForecast</valueName>
      <value>${timestep.forecast_hour || 'T+0 hr'}</value>
    </parameter>${regionalText}
    <area>
      <areaDesc><![CDATA[${districtName}, ${cityName}, India]]></areaDesc>
      <circle>${lat},${lon},${radiusKm}</circle>
    </area>
  </info>
</alert>`;
}
