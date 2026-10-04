/**
 * ==============================================================================
 * IMD & WMO DUAL-MODE PREDICTION & ALERT CLASSIFICATION ENGINE
 * Smart India Hackathon 2026 | Problem Statement ID: 26071
 * ==============================================================================
 */

/**
 * IMD Official 24-Hour & Hourly SOP Rainfall Thresholds
 * Source: India Meteorological Department (mausam.imd.gov.in)
 */
export const IMD_OFFICIAL_THRESHOLDS = {
  GREEN: {
    level: "Green",
    label: "No Warning / Light to Moderate",
    sop24h: "< 64.5 mm / 24h",
    sopHourly: "< 15.5 mm/hr",
    action: "No warning. Normal monsoon activities.",
    color: "#22c55e",
    protocol: "IMD Standard Operating Procedure"
  },
  YELLOW: {
    level: "Yellow",
    label: "Be Updated / Heavy Rain (64.5 - 115.5 mm)",
    sop24h: "64.5 - 115.5 mm / 24h",
    sopHourly: "15.6 - 49.9 mm/hr",
    action: "Be Updated: Moderate traffic delay. Water accumulation in low-lying roads.",
    color: "#eab308",
    protocol: "IMD Standard Operating Procedure"
  },
  ORANGE: {
    level: "Orange",
    label: "Be Prepared / Very Heavy Rain (115.6 - 204.4 mm)",
    sop24h: "115.6 - 204.4 mm / 24h",
    sopHourly: "50.0 - 99.9 mm/hr",
    action: "Be Prepared: Significant waterlogging, rail/road disruptions. Subways at risk.",
    color: "#f97316",
    protocol: "IMD Standard Operating Procedure"
  },
  RED: {
    level: "Red",
    label: "Take Action / Extremely Heavy Rain (> 204.4 mm)",
    sop24h: "> 204.4 mm / 24h",
    sopHourly: ">= 100.0 mm/hr",
    action: "Take Action: Severe flash flooding, widespread transit paralysis, power outages. Evacuate lowlands.",
    color: "#ef4444",
    protocol: "IMD Standard Operating Procedure"
  }
};

/**
 * WMO International Meteorological Heavy Rain Scale
 */
export const WMO_GLOBAL_THRESHOLDS = {
  GREEN: {
    level: "Green",
    label: "Minor / Minimal Rain (< 20 mm / 24h)",
    sopHourly: "< 5.0 mm/hr",
    action: "Normal atmospheric conditions. Routine operations.",
    color: "#22c55e",
    protocol: "WMO International Guidelines"
  },
  YELLOW: {
    level: "Yellow",
    label: "Moderate Rain Advisory (20 - 50 mm / 24h)",
    sopHourly: "5.0 - 14.9 mm/hr",
    action: "Advisory: Localized surface ponding. Commuter vigilance advised.",
    color: "#eab308",
    protocol: "WMO International Guidelines"
  },
  ORANGE: {
    level: "Orange",
    label: "Severe Rain Watch (50 - 100 mm / 24h)",
    sopHourly: "15.0 - 29.9 mm/hr",
    action: "Severe Watch: Elevated river discharges, urban drainage stress.",
    color: "#f97316",
    protocol: "WMO International Guidelines"
  },
  RED: {
    level: "Red",
    label: "Extreme Rain Warning (> 100 mm / 24h)",
    sopHourly: ">= 30.0 mm/hr",
    action: "Extreme Warning: Severe flood danger, structural runoff inundation.",
    color: "#ef4444",
    protocol: "WMO International Guidelines"
  }
};

/**
 * Evaluates rainfall intensity and returns Alert Details based on active protocol
 * @param {number} rainRateMmHr - Hourly rain rate
 * @param {boolean} [useImdProtocol=true] - Whether to apply official IMD SOP
 */
export function classifyRainfallAlert(rainRateMmHr, useImdProtocol = true) {
  if (useImdProtocol) {
    if (rainRateMmHr >= 100.0) return IMD_OFFICIAL_THRESHOLDS.RED;
    if (rainRateMmHr >= 50.0) return IMD_OFFICIAL_THRESHOLDS.ORANGE;
    if (rainRateMmHr >= 15.6) return IMD_OFFICIAL_THRESHOLDS.YELLOW;
    return IMD_OFFICIAL_THRESHOLDS.GREEN;
  } else {
    // WMO Global scale
    if (rainRateMmHr >= 30.0) return WMO_GLOBAL_THRESHOLDS.RED;
    if (rainRateMmHr >= 15.0) return WMO_GLOBAL_THRESHOLDS.ORANGE;
    if (rainRateMmHr >= 5.0) return WMO_GLOBAL_THRESHOLDS.YELLOW;
    return WMO_GLOBAL_THRESHOLDS.GREEN;
  }
}

/**
 * Rule-Based Hydrological Inundation Model (SCS-CN Runoff Approximation)
 */
export function computeInundationRisk(rainRateMmHr, elevationM, drainageCapacityMmHr = 25) {
  if (rainRateMmHr > 80 && elevationM < 6) {
    const depth = Math.round(35 + (rainRateMmHr - 80) * 0.85);
    return {
      riskLevel: "CRITICAL",
      color: "#ef4444",
      depthCm: depth,
      depthMeters: (depth / 100).toFixed(2),
      description: "Severe deep-water drowning of roads, underpasses & railway tracks.",
      evacuationRecommended: true
    };
  } else if (rainRateMmHr > 45 && elevationM < 10) {
    const depth = Math.round(15 + (rainRateMmHr - 45) * 0.5);
    return {
      riskLevel: "HIGH",
      color: "#f97316",
      depthCm: depth,
      depthMeters: (depth / 100).toFixed(2),
      description: "Water accumulation in subways and saucer depressions. Vehicular stall risk.",
      evacuationRecommended: false
    };
  } else if (rainRateMmHr > 20 && elevationM < 15) {
    const depth = Math.round(5 + (rainRateMmHr - 20) * 0.25);
    return {
      riskLevel: "MODERATE",
      color: "#eab308",
      depthCm: depth,
      depthMeters: (depth / 100).toFixed(2),
      description: "Pavement ponding and sluggish curb drainage.",
      evacuationRecommended: false
    };
  } else {
    return {
      riskLevel: "LOW / NONE",
      color: "#22c55e",
      depthCm: 0,
      depthMeters: "0.00",
      description: "No significant surface water pooling expected.",
      evacuationRecommended: false
    };
  }
}

/**
 * Calculates city-wide aggregated statistics for the current timestep
 */
export function calculateTimestepSummary(scenarioData, stepIndex, useImdProtocol = true) {
  const stations = scenarioData.stations_by_step[stepIndex] || [];
  const grid = scenarioData.grids_by_step[stepIndex] || [];
  const districts = scenarioData.districts || [];
  
  let maxRain = 0;
  let totalRain = 0;
  let criticalStations = 0;
  let severeCells = 0;
  let highestAlert = "Green";
  
  stations.forEach(s => {
    if (s.rain_rate_mmhr > maxRain) maxRain = s.rain_rate_mmhr;
    totalRain += s.rain_rate_mmhr;
    if (s.rain_rate_mmhr >= 50) criticalStations++;
  });
  
  grid.forEach(cell => {
    if (cell.flood_depth_cm > 20) severeCells++;
  });
  
  const avgRain = stations.length > 0 ? (totalRain / stations.length).toFixed(1) : 0;
  
  districts.forEach(d => {
    const alert = d.alerts[stepIndex];
    if (alert === "Red") highestAlert = "Red";
    else if (alert === "Orange" && highestAlert !== "Red") highestAlert = "Orange";
    else if (alert === "Yellow" && highestAlert !== "Red" && highestAlert !== "Orange") highestAlert = "Yellow";
  });

  const inundatedAreaSqKm = (severeCells * 1.8).toFixed(1);
  const estimatedImpactedPop = Math.round(severeCells * 42500);

  return {
    stepIndex,
    maxRainMmHr: maxRain.toFixed(1),
    avgRainMmHr: avgRain,
    criticalStations,
    totalStations: stations.length,
    severeCells,
    highestAlert,
    inundatedAreaSqKm,
    estimatedImpactedPop: estimatedImpactedPop.toLocaleString('en-IN'),
    alertDetails: classifyRainfallAlert(maxRain, useImdProtocol)
  };
}
