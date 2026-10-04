import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapDashboard from './components/MapDashboard';
import TimeSlider from './components/TimeSlider';
import SidebarAlerts from './components/SidebarAlerts';
import AIAdvisoryCard from './components/AIAdvisoryCard';
import DataSourcesModal from './components/DataSourcesModal';
import DemoGuideModal from './components/DemoGuideModal';
import IntroLanding from './components/IntroLanding';
import DisseminationModal from './components/DisseminationModal';
import CapExportModal from './components/CapExportModal';
import CitizenView from './components/CitizenView';

import mumbaiScenario from './data/mumbai_scenario.json';
import chennaiScenario from './data/chennai_scenario.json';
import bengaluruScenario from './data/bengaluru_scenario.json';
import { calculateTimestepSummary } from './utils/predictionEngine';
import { getBrowserCoordinates, fetchLiveWeatherScenario } from './services/liveWeatherService';
import { generateAIAdvisory } from './services/aiAdvisoryService';

import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeMode, setActiveMode] = useState('live'); // 'live' | 'bengaluru' | 'mumbai' | 'chennai'
  const [currentStep, setCurrentStep] = useState(0);
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isDisseminationOpen, setIsDisseminationOpen] = useState(false);
  const [isCapExportOpen, setIsCapExportOpen] = useState(false);
  const [userRole, setUserRole] = useState('official'); // 'official' | 'citizen'
  const [selectedStation, setSelectedStation] = useState(null);

  // Dual Protocol State: true = IMD SOP (India), false = WMO Global
  const [useImdProtocol, setUseImdProtocol] = useState(true);

  // Live Geolocation and Weather States
  const [geoStatus, setGeoStatus] = useState('detecting');
  const [liveScenario, setLiveScenario] = useState(null);

  // AI-Generated Linguistic Advisory State
  const [aiAdvisory, setAiAdvisory] = useState(null);

  // Initialize Geolocation & Live Weather on Mount
  useEffect(() => {
    async function initLiveLocation() {
      setGeoStatus('detecting');
      try {
        const coords = await getBrowserCoordinates();
        if (coords.error) {
          console.warn("Geolocation denied or unavailable:", coords.message);
          setGeoStatus('denied');
          setActiveMode('bengaluru');
        } else {
          const scenario = await fetchLiveWeatherScenario(coords.lat, coords.lon, useImdProtocol);
          setLiveScenario(scenario);
          setGeoStatus('success');
          setActiveMode('live');
          // If detected country is outside India, default to WMO Global, else IMD SOP
          if (!scenario.isIndia) {
            setUseImdProtocol(false);
          } else {
            setUseImdProtocol(true);
          }
        }
      } catch (err) {
        console.error("Live weather fetch error:", err);
        setGeoStatus('error');
        setActiveMode('bengaluru');
      }
    }

    initLiveLocation();
  }, []);

  // Handle Search / Coordinate Change for Live Mode
  const handleSelectCityCoords = async (lat, lon, displayName) => {
    try {
      setGeoStatus('detecting');
      const scenario = await fetchLiveWeatherScenario(lat, lon, useImdProtocol);
      setLiveScenario(scenario);
      setGeoStatus('success');
      setActiveMode('live');
      setCurrentStep(0);
      if (!scenario.isIndia) {
        setUseImdProtocol(false);
      } else {
        setUseImdProtocol(true);
      }
    } catch (e) {
      console.error("Failed to load searched city:", e);
    }
  };

  // Determine active scenario data object
  let scenarioData = mumbaiScenario;
  if (activeMode === 'live' && liveScenario) {
    scenarioData = liveScenario;
  } else if (activeMode === 'bengaluru') {
    scenarioData = bengaluruScenario;
  } else if (activeMode === 'chennai') {
    scenarioData = chennaiScenario;
  } else {
    scenarioData = mumbaiScenario;
  }

  // Calculate real-time summary and alert classification with active protocol
  const isIndia = scenarioData.isIndia !== undefined ? scenarioData.isIndia : (activeMode === 'bengaluru' || activeMode === 'mumbai' || activeMode === 'chennai');
  const summary = calculateTimestepSummary(scenarioData, currentStep, isIndia && useImdProtocol);

  // Generate AI Advisory whenever scenario, step, or protocol changes
  useEffect(() => {
    async function updateAIAdvisory() {
      const locationInfo = {
        city: scenarioData.cityName || scenarioData.city,
        state: scenarioData.stateName || (activeMode === 'bengaluru' ? 'Karnataka' : activeMode === 'mumbai' ? 'Maharashtra' : activeMode === 'chennai' ? 'Tamil Nadu' : ''),
        country: scenarioData.countryName || 'India',
        district: scenarioData.districtName || (activeMode === 'bengaluru' ? 'Bengaluru Urban' : activeMode === 'mumbai' ? 'Mumbai Suburban' : activeMode === 'chennai' ? 'Chennai' : '')
      };

      const adv = await generateAIAdvisory({
        forecastJson: scenarioData.timesteps[currentStep],
        locationInfo,
        alertLevel: summary.highestAlert,
        rainRate: summary.maxRainMmHr,
        isIndia,
        useImdProtocol
      });

      setAiAdvisory(adv);
    }

    updateAIAdvisory();
  }, [scenarioData, currentStep, summary.highestAlert, summary.maxRainMmHr, isIndia, useImdProtocol]);

  // Handle Mode Switch (Live vs Simulated scenarios)
  const handleSelectMode = (mode) => {
    setActiveMode(mode);
    setCurrentStep(0);
    if (mode === 'bengaluru' || mode === 'mumbai' || mode === 'chennai') {
      setUseImdProtocol(true);
    }
  };

  // Dynamic Banner Text
  let bannerClass = 'banner-green';
  let bannerText = "Normal meteorological conditions. Standard monitoring in progress.";
  const isLive = scenarioData.isLiveData;

  if (summary.highestAlert === 'Red') {
    bannerClass = 'banner-red';
    bannerText = `EMERGENCY ALERT: Severe Heavy Rainfall (${summary.maxRainMmHr} mm/hr) over ${scenarioData.cityName || scenarioData.city}. Extreme Inundation Imminent! Lead Time: 0-1 hr.`;
  } else if (summary.highestAlert === 'Orange') {
    bannerClass = 'banner-orange';
    bannerText = `EARLY WARNING ISSUED: Very Heavy Rainfall (${summary.maxRainMmHr} mm/hr) intensifying. Waterlogging likely in low-lying subways within 1-2 hours.`;
  } else if (summary.highestAlert === 'Yellow') {
    bannerClass = 'banner-yellow';
    bannerText = `WEATHER WATCH: Moderate to Heavy rain bands active. Municipal storm drainage on standby.`;
  } else {
    if (isLive) {
      bannerText = `LIVE REPORT (${scenarioData.cityName || "Current Location"}): Real precipitation forecast is ${summary.maxRainMmHr} mm/hr. Conditions currently stable.`;
    }
  }

  return (
    <div className="app-container">
      {/* Intro Modal with Geolocation on Initial Load */}
      {isIntroOpen && (
        <IntroLanding 
          geoStatus={geoStatus}
          liveScenario={liveScenario}
          onLaunchLive={() => {
            setActiveMode('live');
            setIsIntroOpen(false);
          }}
          onLaunchBengaluru={() => {
            setActiveMode('bengaluru');
            setIsIntroOpen(false);
          }}
          onLaunchDemo={() => {
            setActiveMode('mumbai');
            setIsIntroOpen(false);
          }}
          onSelectCityCoords={(lat, lon, name) => {
            handleSelectCityCoords(lat, lon, name);
            setIsIntroOpen(false);
          }}
        />
      )}

      {/* Top Operations Navbar */}
      <Navbar 
        activeMode={activeMode}
        liveLocationName={liveScenario?.cityName}
        geoInfo={liveScenario?.geoInfo}
        useImdProtocol={useImdProtocol}
        onToggleProtocol={() => setUseImdProtocol(!useImdProtocol)}
        onSelectMode={handleSelectMode}
        onSelectCityCoords={handleSelectCityCoords}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        highestAlert={summary.highestAlert}
        userRole={userRole}
        onToggleRole={() => setUserRole(userRole === 'official' ? 'citizen' : 'official')}
        onOpenDissemination={() => setIsDisseminationOpen(true)}
        onOpenCapExport={() => setIsCapExportOpen(true)}
      />

      {/* AI-Generated Natural Language Public Advisory Headline Card */}
      <AIAdvisoryCard 
        advisory={aiAdvisory}
        alertLevel={summary.highestAlert}
        isIndia={isIndia}
        useImdProtocol={useImdProtocol}
      />

      {/* Dynamic IMD Early Warning Banner */}
      <div className={`alert-banner ${bannerClass}`}>
        <div className="banner-content">
          <ShieldAlert size={18} />
          <span className="banner-badge">
            {isIndia && useImdProtocol ? `IMD ${summary.highestAlert.toUpperCase()} ALERT` : `WMO ${summary.highestAlert.toUpperCase()} ALERT`}
          </span>
          <span>{bannerText}</span>
        </div>
        <div style={{ fontSize: '0.74rem', opacity: 0.9, fontFamily: 'JetBrains Mono' }}>
          {scenarioData.timesteps[currentStep]?.label} ({scenarioData.timesteps[currentStep]?.forecast_hour})
        </div>
      </div>

      {/* Main View: Citizen Safety View vs DDMA/IMD Operations Center */}
      {userRole === 'citizen' ? (
        <CitizenView 
          scenarioData={scenarioData}
          currentStep={currentStep}
          summary={summary}
          aiAdvisory={aiAdvisory}
          onSwitchToOfficial={() => setUserRole('official')}
        />
      ) : (
        <main className="dashboard-layout">
          <MapDashboard 
            scenarioData={scenarioData}
            currentStep={currentStep}
            onStationClick={(st) => setSelectedStation(st)}
          />

          <TimeSlider 
            timesteps={scenarioData.timesteps}
            currentStep={currentStep}
            onChangeStep={setCurrentStep}
          />

          <SidebarAlerts 
            scenarioData={scenarioData}
            currentStep={currentStep}
            summary={summary}
            useImdProtocol={useImdProtocol}
            onOpenDissemination={() => setIsDisseminationOpen(true)}
            onOpenCapExport={() => setIsCapExportOpen(true)}
          />
        </main>
      )}

      {/* Multi-Channel Alert Dissemination Simulator Modal */}
      <DisseminationModal 
        isOpen={isDisseminationOpen}
        onClose={() => setIsDisseminationOpen(false)}
        scenarioData={scenarioData}
        currentStep={currentStep}
        summary={summary}
        aiAdvisory={aiAdvisory}
        useImdProtocol={useImdProtocol}
      />

      {/* CAP 1.2 XML Export Modal */}
      <CapExportModal 
        isOpen={isCapExportOpen}
        onClose={() => setIsCapExportOpen(false)}
        scenarioData={scenarioData}
        currentStep={currentStep}
        summary={summary}
        aiAdvisory={aiAdvisory}
        useImdProtocol={useImdProtocol}
      />

      {/* Multi-Sensor Architecture & AI Skill Scores Modal */}
      <DataSourcesModal 
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        verificationStats={scenarioData.model_verification_stats}
        onSelectSavedLocation={handleSelectCityCoords}
      />

      {/* SIH Judge Demo Script & Flow Modal */}
      <DemoGuideModal 
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onJumpToStep={(step, mode = 'bengaluru') => {
          setActiveMode(mode);
          setCurrentStep(step);
          setUseImdProtocol(true);
        }}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
      />
    </div>
  );
}
