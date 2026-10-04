# SIH 2026 Hackathon Demo & Jury Presentation Script
## Problem Statement ID: 26071 | MoES / India Meteorological Department (IMD)
### AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System

---

## 🎯 60-Second Elevator Pitch (Start with this)
> *"Honorable Jury, during extreme monsoon downpours and cyclonic surges, conventional forecasting systems operate in silos. Radar, satellites, and numerical weather predictions rarely synchronize in real-time with urban elevation and drainage realities.  
> We have built an **Integrated Multi-Sensor AI/ML Early Warning and Inundation Prediction Platform** that fuses INSAT satellite imagery, Doppler weather radar reflectivity, AWS ground telemetry, and NWP forecasts with high-resolution SRTM topography. Our system generates district-level IMD color-coded early warnings with actionable lead times of 1 to 4 hours and pinpoints flooded subways and railway corridors before catastrophic waterlogging occurs."*

---

## 🎬 Step-by-Step Live Demo Flow (Screen by Screen)

### Screen 1: Normal Baseline Conditions (T+0 hr — 14:00 IST)
1. **Action:** Open the dashboard at `http://localhost:3000` (or `http://192.168.1.18:3000` on your tablet/phone on the local network).
2. **Visual state:**
   - Landing modal explains the problem in one line. Click **"Launch Live Early Warning Command Center"**.
   - Top notification banner is **GREEN**: *"Normal meteorological conditions. Standard monsoon monitoring in progress."*
   - Weather stations (Colaba, Santacruz, Dadar, Kurla) show light rain rates (8–14 mm/hr) with pulsing green indicators.
   - Low-elevation basins (Mithi River, Hindmata, Andheri Subway) have 0 cm surface inundation.
3. **Judge Talk-Track:**
   > *"We begin under baseline monsoon conditions over Mumbai. All AWS stations report normal readings, and our rule-based AI engine indicates Green status with zero risk to transit."*

---

### Screen 2: Convective Storm Inflow (T+1 to T+2 hr — 15:00 to 16:00 IST)
1. **Action:** Click Play on the Time Slider or drag the handle to **T+1** and then **T+2**.
2. **Visual state:**
   - Rain heatmap intensifies from green to yellow, and then orange.
   - Banner changes to **ORANGE ALERT**: *"EARLY WARNING ISSUED: Very Heavy Rainfall intensifying. Waterlogging likely in low-lying subways within 1-2 hours."*
   - AWS telemetry at Kurla and Dadar jumps to 78–92 mm/hr; barometric pressure drops from 1006 hPa to 999 hPa.
   - The Sidebar Lead Time indicator states: **"1 hr to cloudburst"**.
3. **Judge Talk-Track:**
   > *"Notice what happens as the outer convective bands make landfall. As radar reflectivity crosses 45 dBZ and cloud-top temperatures plunge below 220 K, our spatiotemporal nowcasting engine detects rapid storm intensification. The system automatically elevates the alert to ORANGE, giving municipal authorities and disaster management teams a critical 1-to-2 hour lead time to activate storm pumps."*

---

### Screen 3: The Cloudburst Deluge & Inundation Peaking (T+3 hr — 17:00 IST)
1. **Action:** Move the Time Slider to **T+3 (Peak Deluge)**.
2. **Visual state:**
   - The entire top banner turns **PULSING RED ALERT**:  
     *"EMERGENCY ALERT: Severe Cloudburst (148.0 mm/hr) over Kurla-Santacruz & Mithi Basin. Extreme Inundation Imminent! Lead Time: 0-1 hr."*
   - The Mithi River alluvial floodplain, Hindmata saucer depression, and Milan/Andheri underpasses glow red with **1.8 to 2.4 meters** of calculated flood depth.
   - The Critical Infrastructure card flips:
     - Suburban Railway Corridors: **Kurla Tracks Flooded (>250mm water)**
     - Underpass Subways: **CLOSED (Inundation Depth: 1.8m)**
   - Impact metrics update in real time: **14.4 km² inundated area**, **382,500 citizens at flood risk**.
3. **Judge Talk-Track:**
   > *"This is the critical decision-support moment. At T+3, a convective cloudburst dumps over 140 mm/hr right over the low-lying Mithi basin. Coupling precipitation with SRTM elevation and SCS-CN runoff reveals that the drainage outfall is overwhelmed. The system automatically triggers an actionable IMD RED ALERT bulletin, recommending the immediate closure of subways and diversion of suburban rail traffic before lives are endangered."*

---

### Screen 4: Multi-Sensor Architecture & Technical Q&A
1. **Action:**
   - In the map panel, toggle **"Doppler Radar (dBZ)"** to show the Marshall-Palmer radar reflectivity core.
   - Toggle **"INSAT Satellite IR"** to show overshooting convective cloud tops.
   - Click the **"Data Sources & AI Metrics"** button in the top navbar.
2. **Visual state:**
   - Architecture modal displays the 5 heterogeneous sources (INSAT, DWR S-Band, AWS/ARG, NWP WRF, SRTM DEM).
   - Shows meteorological verification skill scores:
     - **Probability of Detection (POD): 89.2%**
     - **False Alarm Ratio (FAR): 13.8%**
     - **Critical Success Index (CSI): 78.1%**
     - **ROC-AUC: 0.942**
3. **Judge Talk-Track:**
   > *"Under the hood, our pipeline features a modular, plug-and-play architecture. We have written connectors for MOSDAC INSAT-3D/3DR HDF5 streams, IMD polarimetric radar mosaics, and high-resolution WRF model grids. When live API credentials are authenticated, the exact same inference pipeline consumes the real-time feeds without modifying downstream models."*

---

### Bonus Screen: Cyclone Scenario Switcher
- In the top navbar, toggle from **"Mumbai"** to **"Chennai (Cyclonic Adyar Surge)"** to prove that the platform generalizes across distinct flood topologies (flash convective cloudbursts vs cyclonic riverbank surges).
