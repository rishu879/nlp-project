import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  CloudRain, 
  Radar, 
  Satellite, 
  MapPin, 
  Mountain, 
  Waves, 
  Layers,
  Tent
} from 'lucide-react';
import { getSheltersForLocation } from '../data/sheltersData';

export default function MapDashboard({ 
  scenarioData, 
  currentStep, 
  onStationClick 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Layer Visibility States
  const [layers, setLayers] = useState({
    rainfall: true,
    radar: false,
    satellite: false,
    stations: true,
    elevation: true,
    floodZones: true,
    shelters: true
  });

  // Layer Groups refs for dynamic re-rendering
  const rainLayerGroupRef = useRef(L.layerGroup());
  const radarLayerGroupRef = useRef(L.layerGroup());
  const satelliteLayerGroupRef = useRef(L.layerGroup());
  const stationsLayerGroupRef = useRef(L.layerGroup());
  const elevationLayerGroupRef = useRef(L.layerGroup());
  const floodZonesLayerGroupRef = useRef(L.layerGroup());
  const sheltersLayerGroupRef = useRef(L.layerGroup());
  const userBeaconGroupRef = useRef(L.layerGroup());

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [scenarioData.center.lat, scenarioData.center.lon],
        zoom: scenarioData.zoom || 11,
        zoomControl: false,
        attributionControl: false
      });

      // Esri World Dark Gray Base: High-performance, Dark Theme GIS, No API Key Required, No Watermark!
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        subdomains: ['server', 'services'],
        attribution: '&copy; Esri &mdash; World Dark Gray Base'
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Layer Groups to Map
      rainLayerGroupRef.current.addTo(map);
      radarLayerGroupRef.current.addTo(map);
      satelliteLayerGroupRef.current.addTo(map);
      stationsLayerGroupRef.current.addTo(map);
      elevationLayerGroupRef.current.addTo(map);
      floodZonesLayerGroupRef.current.addTo(map);
      sheltersLayerGroupRef.current.addTo(map);
      userBeaconGroupRef.current.addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.flyTo(
        [scenarioData.center.lat, scenarioData.center.lon], 
        scenarioData.zoom || 11, 
        { duration: 1.2 }
      );
    }
  }, [scenarioData.center.lat, scenarioData.center.lon, scenarioData.city]);

  // Update Layers when timestep or scenario changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const currentGrid = scenarioData.grids_by_step[currentStep] || [];
    const currentStations = scenarioData.stations_by_step[currentStep] || [];

    // 0. UPDATE USER BEACON MARKER IF LIVE DATA
    userBeaconGroupRef.current.clearLayers();
    if (scenarioData.isLiveData) {
      const beaconHtml = `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #06b6d4;
            opacity: 0.35;
            animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #0284c7;
            border: 2px solid #ffffff;
            box-shadow: 0 0 12px #38bdf8;
          "></div>
        </div>
      `;
      const beaconIcon = L.divIcon({
        html: beaconHtml,
        className: 'user-beacon-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const userMarker = L.marker([scenarioData.center.lat, scenarioData.center.lon], { icon: beaconIcon });
      userMarker.bindTooltip(`
        <div style="font-family: Inter, sans-serif; font-size: 11px;">
          <b style="color: #38bdf8;">📍 Your Verified Location</b><br/>
          ${scenarioData.city}<br/>
          Live Open-Meteo Weather Feed
        </div>
      `, { permanent: false, sticky: true });
      userBeaconGroupRef.current.addLayer(userMarker);
    }

    // 1. UPDATE RAINFALL HEATMAP LAYER
    rainLayerGroupRef.current.clearLayers();
    if (layers.rainfall) {
      currentGrid.forEach(cell => {
        const rain = cell.rainfall_intensity_mmhr;
        let color = '#22c55e';
        let radius = 1800;
        let fillOpacity = 0.35;

        if (rain >= 100) {
          color = '#ef4444';
          fillOpacity = 0.65;
          radius = 2400;
        } else if (rain >= 50) {
          color = '#f97316';
          fillOpacity = 0.55;
          radius = 2100;
        } else if (rain >= 15) {
          color = '#eab308';
          fillOpacity = 0.45;
          radius = 1900;
        } else if (rain <= 0.2) {
          fillOpacity = 0.15;
          radius = 1500;
        }

        const circle = L.circle([cell.lat, cell.lon], {
          radius: radius,
          color: color,
          weight: 1,
          opacity: 0.8,
          fillColor: color,
          fillOpacity: fillOpacity
        });

        circle.bindTooltip(`
          <div style="font-family: Inter, sans-serif; font-size: 11px;">
            <b style="color: ${color};">Precipitation: ${rain} mm/hr</b><br/>
            Inundation Risk: ${cell.inundation_risk}<br/>
            Est. Surface Depth: ${cell.flood_depth_cm} cm
          </div>
        `, { sticky: true });

        rainLayerGroupRef.current.addLayer(circle);
      });
    }

    // 2. UPDATE RADAR REFLECTIVITY (dBZ) LAYER
    radarLayerGroupRef.current.clearLayers();
    if (layers.radar) {
      currentGrid.forEach(cell => {
        const dbz = cell.radar_reflectivity_dbz;
        let color = '#06b6d4';

        if (dbz >= 55) color = '#ec4899';
        else if (dbz >= 45) color = '#ef4444';
        else if (dbz >= 38) color = '#f97316';
        else if (dbz >= 30) color = '#eab308';
        else if (dbz >= 22) color = '#22c55e';

        const radarCircle = L.circle([cell.lat, cell.lon], {
          radius: 1700,
          color: color,
          weight: 0,
          fillColor: color,
          fillOpacity: 0.6
        });

        radarCircle.bindTooltip(`
          <div style="font-family: Inter, sans-serif; font-size: 11px;">
            <b>Doppler Radar Reflectivity: ${dbz} dBZ</b><br/>
            S-Band Polarimetric Core
          </div>
        `, { sticky: true });

        radarLayerGroupRef.current.addLayer(radarCircle);
      });
    }

    // 3. UPDATE SATELLITE IR CLOUD TOP LAYER
    satelliteLayerGroupRef.current.clearLayers();
    if (layers.satellite) {
      currentGrid.forEach(cell => {
        const tempK = cell.satellite_brightness_temp_k;
        let color = '#6366f1';
        let fillOpacity = 0.25;

        if (tempK <= 205) {
          color = '#ffffff';
          fillOpacity = 0.8;
        } else if (tempK <= 220) {
          color = '#38bdf8';
          fillOpacity = 0.65;
        } else if (tempK <= 240) {
          color = '#818cf8';
          fillOpacity = 0.45;
        }

        const satCircle = L.circle([cell.lat, cell.lon], {
          radius: 2000,
          color: color,
          weight: 0,
          fillColor: color,
          fillOpacity: fillOpacity
        });

        satCircle.bindTooltip(`
          <div style="font-family: Inter, sans-serif; font-size: 11px;">
            <b>Satellite Cloud Top Temp: ${tempK} K</b><br/>
            Infrared Convective Core
          </div>
        `, { sticky: true });

        satelliteLayerGroupRef.current.addLayer(satCircle);
      });
    }

    // 4. UPDATE AWS WEATHER STATIONS LAYER
    stationsLayerGroupRef.current.clearLayers();
    if (layers.stations) {
      currentStations.forEach(st => {
        const alertColor = st.alert_level === 'Red' ? '#ef4444' :
                           st.alert_level === 'Orange' ? '#f97316' :
                           st.alert_level === 'Yellow' ? '#eab308' : '#22c55e';

        const iconHtml = `
          <div style="
            position: relative;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background: ${alertColor};
              opacity: 0.4;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: ${alertColor};
              border: 2px solid #ffffff;
              box-shadow: 0 0 8px ${alertColor};
            "></div>
          </div>
        `;

        const stationIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-station-icon',
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([st.lat, st.lon], { icon: stationIcon });

        const popupContent = `
          <div class="station-popup">
            <div class="station-popup-title">${st.name}</div>
            <div class="station-popup-row">
              <span>District:</span>
              <span class="station-popup-val">${st.district}</span>
            </div>
            <div class="station-popup-row">
              <span>Rainfall Rate:</span>
              <span class="station-popup-val" style="color: ${alertColor}; font-weight: 700;">${st.rain_rate_mmhr} mm/hr</span>
            </div>
            <div class="station-popup-row">
              <span>Accumulated Rain:</span>
              <span class="station-popup-val">${st.accum_rainfall_mm} mm</span>
            </div>
            <div class="station-popup-row">
              <span>Air Temperature:</span>
              <span class="station-popup-val">${st.temperature_c} °C</span>
            </div>
            <div class="station-popup-row">
              <span>Relative Humidity:</span>
              <span class="station-popup-val">${st.humidity_pct} %</span>
            </div>
            <div class="station-popup-row">
              <span>Barometric Pressure:</span>
              <span class="station-popup-val">${st.pressure_hpa} hPa</span>
            </div>
            <div class="station-popup-row">
              <span>Surface Wind:</span>
              <span class="station-popup-val">${st.wind_speed_kmh} km/h (${st.wind_direction})</span>
            </div>
            <div class="station-popup-row" style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1);">
              <span>IMD Alert:</span>
              <span class="station-popup-val" style="color: ${alertColor}; font-weight: 700;">${st.alert_level.toUpperCase()}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onStationClick) onStationClick(st);
        });

        stationsLayerGroupRef.current.addLayer(marker);
      });
    }

    // 5. UPDATE ELEVATION ZONES
    elevationLayerGroupRef.current.clearLayers();
    if (layers.elevation && scenarioData.elevation_zones) {
      L.geoJSON(scenarioData.elevation_zones, {
        style: (feature) => {
          const cat = feature.properties.elevation_category;
          if (cat.includes('Low')) {
            return {
              color: '#3b82f6',
              weight: 1.5,
              dashArray: '4, 4',
              fillColor: '#1d4ed8',
              fillOpacity: 0.15
            };
          } else if (cat.includes('High')) {
            return {
              color: '#84cc16',
              weight: 1.5,
              fillColor: '#4d7c0f',
              fillOpacity: 0.12
            };
          } else {
            return {
              color: '#64748b',
              weight: 1,
              fillColor: '#334155',
              fillOpacity: 0.08
            };
          }
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(`
            <div style="font-family: Inter, sans-serif; font-size: 11px;">
              <b>Elevation Zone: ${feature.properties.name}</b><br/>
              Category: ${feature.properties.elevation_category}<br/>
              Average MSL: ${feature.properties.avg_elevation_m}m | Slope: ${feature.properties.slope_pct}%<br/>
              <i>${feature.properties.vulnerability}</i>
            </div>
          `, { sticky: true });
        }
      }).addTo(elevationLayerGroupRef.current);
    }

    // 6. UPDATE HISTORICAL FLOOD-PRONE INUNDATION ZONES
    floodZonesLayerGroupRef.current.clearLayers();
    if (layers.floodZones && scenarioData.historical_flood_zones) {
      const maxCityRain = Math.max(...currentStations.map(s => s.rain_rate_mmhr), 0);

      L.geoJSON(scenarioData.historical_flood_zones, {
        style: () => {
          const isCritical = maxCityRain >= 70;
          return {
            color: isCritical ? '#ef4444' : '#f97316',
            weight: 2,
            fillColor: isCritical ? '#ef4444' : '#f97316',
            fillOpacity: isCritical ? 0.35 : 0.2
          };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          const currDepth = maxCityRain > 90 ? (p.max_recorded_depth_m * 0.85).toFixed(1) :
                            maxCityRain > 45 ? (p.max_recorded_depth_m * 0.45).toFixed(1) : "0.2";

          layer.bindPopup(`
            <div class="station-popup">
              <div class="station-popup-title" style="color: #ef4444;">🚨 ${p.zone_name}</div>
              <div class="station-popup-row">
                <span>Predicted Flood Depth:</span>
                <span class="station-popup-val" style="color: #ef4444; font-weight: 700;">${currDepth} Meters</span>
              </div>
              <div class="station-popup-row">
                <span>Historical Context:</span>
                <span class="station-popup-val">${p.historical_record}</span>
              </div>
              <div class="station-popup-row">
                <span>Population at Risk:</span>
                <span class="station-popup-val">${p.population_at_risk?.toLocaleString('en-IN')} citizens</span>
              </div>
              <div class="station-popup-row">
                <span>Drainage Outfall Limit:</span>
                <span class="station-popup-val">${p.drainage_capacity_mmhr} mm/hr</span>
              </div>
              <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">
                <b>Critical Assets:</b> ${p.critical_assets?.join(', ')}
              </div>
            </div>
          `);
        }
      }).addTo(floodZonesLayerGroupRef.current);
    }

    // 7. UPDATE RELIEF SHELTERS (HIGH GROUND) LAYER
    sheltersLayerGroupRef.current.clearLayers();
    if (layers.shelters) {
      const shelters = getSheltersForLocation(scenarioData);
      shelters.forEach(sh => {
        const shelterIconHtml = `
          <div style="
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #064e3b;
            border: 2px solid #22c55e;
            border-radius: 8px;
            box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
            cursor: pointer;
          ">
            <span style="font-size: 14px; line-height: 1;">⛺</span>
          </div>
        `;

        const icon = L.divIcon({
          html: shelterIconHtml,
          className: 'custom-shelter-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([sh.lat, sh.lon], { icon });

        marker.bindPopup(`
          <div class="station-popup">
            <div class="station-popup-title" style="color: #22c55e;">⛺ ${sh.name}</div>
            <div class="station-popup-row">
              <span>Category:</span>
              <span class="station-popup-val">${sh.type}</span>
            </div>
            <div class="station-popup-row">
              <span>DEM Elevation:</span>
              <span class="station-popup-val" style="color: #38bdf8; font-weight: 700;">+${sh.elevation_m}m MSL (Safe High Ground)</span>
            </div>
            <div class="station-popup-row">
              <span>Capacity Status:</span>
              <span class="station-popup-val">${sh.currentOccupancy} / ${sh.capacity} citizens</span>
            </div>
            <div class="station-popup-row">
              <span>Medical Post:</span>
              <span class="station-popup-val" style="color: #34d399;">${sh.medicalPost}</span>
            </div>
            <div class="station-popup-row">
              <span>Generator Backup:</span>
              <span class="station-popup-val">${sh.generatorBackup}</span>
            </div>
            <div class="station-popup-row">
              <span>Drinking Water:</span>
              <span class="station-popup-val">${sh.drinkingWaterLiters?.toLocaleString('en-IN')} L</span>
            </div>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 10px; color: #94a3b8;">
              <b>Address:</b> ${sh.address}<br/>
              <b>Helpline:</b> <span style="color: #38bdf8; font-weight: 600;">${sh.contact}</span>
            </div>
          </div>
        `);

        sheltersLayerGroupRef.current.addLayer(marker);
      });
    }
  }, [scenarioData, currentStep, layers]);

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="map-container-wrapper">
      <div ref={mapContainerRef} className="leaflet-map" />

      {/* Floating Multi-Layer Toggle Panel */}
      <div className="map-floating-controls">
        <div className="glass-panel layer-panel">
          <div className="layer-panel-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#38bdf8" />
              Multi-Sensor Layers
            </span>
          </div>
          <div className="layer-items">
            <button 
              className={`layer-toggle-btn ${layers.rainfall ? 'active' : ''}`}
              onClick={() => toggleLayer('rainfall')}
            >
              <span className="layer-icon-label">
                <CloudRain size={14} color="#38bdf8" />
                Rainfall Heatmap
              </span>
              <div className="toggle-indicator" />
            </button>

            <button 
              className={`layer-toggle-btn ${layers.radar ? 'active' : ''}`}
              onClick={() => toggleLayer('radar')}
            >
              <span className="layer-icon-label">
                <Radar size={14} color="#06b6d4" />
                Doppler Radar (dBZ)
              </span>
              <div className="toggle-indicator" />
            </button>

            <button 
              className={`layer-toggle-btn ${layers.satellite ? 'active' : ''}`}
              onClick={() => toggleLayer('satellite')}
            >
              <span className="layer-icon-label">
                <Satellite size={14} color="#818cf8" />
                INSAT Satellite IR
              </span>
              <div className="toggle-indicator" />
            </button>

            <button 
              className={`layer-toggle-btn ${layers.stations ? 'active' : ''}`}
              onClick={() => toggleLayer('stations')}
            >
              <span className="layer-icon-label">
                <MapPin size={14} color="#34d399" />
                AWS / Rain Gauges
              </span>
              <div className="toggle-indicator" />
            </button>

            <button 
              className={`layer-toggle-btn ${layers.elevation ? 'active' : ''}`}
              onClick={() => toggleLayer('elevation')}
            >
              <span className="layer-icon-label">
                <Mountain size={14} color="#a3e635" />
                DEM Elevation Zones
              </span>
              <div className="toggle-indicator" />
            </button>

            <button 
              className={`layer-toggle-btn ${layers.floodZones ? 'active' : ''}`}
              onClick={() => toggleLayer('floodZones')}
            >
              <span className="layer-icon-label">
                <Waves size={14} color="#ef4444" />
                Inundation Risk Zones
              </span>
              <div className="toggle-indicator" />
            </button>

            <button 
              className={`layer-toggle-btn ${layers.shelters ? 'active' : ''}`}
              onClick={() => toggleLayer('shelters')}
            >
              <span className="layer-icon-label">
                <Tent size={14} color="#22c55e" />
                Relief Shelters (High Ground)
              </span>
              <div className="toggle-indicator" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Map Legend */}
      <div className="glass-panel map-floating-legend">
        <div className="legend-title">IMD Rainfall Intensity Scale</div>
        <div className="legend-scale">
          <div className="legend-row">
            <div className="legend-color-box" style={{ background: '#ef4444' }} />
            <span>&gt; 100 mm/hr (Extremely Heavy / Cloudburst)</span>
          </div>
          <div className="legend-row">
            <div className="legend-color-box" style={{ background: '#f97316' }} />
            <span>50 - 100 mm/hr (Very Heavy Rain)</span>
          </div>
          <div className="legend-row">
            <div className="legend-color-box" style={{ background: '#eab308' }} />
            <span>15 - 50 mm/hr (Moderate to Heavy)</span>
          </div>
          <div className="legend-row">
            <div className="legend-color-box" style={{ background: '#22c55e' }} />
            <span>&lt; 15 mm/hr (Light Rain / Fair)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
