# AI/ML-Based Integrated Heavy Rainfall Early Warning and Inundation Prediction System
### Smart India Hackathon 2026 | Problem Statement ID: 26071
**Organization:** Ministry of Earth Sciences (MoES) | **Department:** India Meteorological Department (IMD)  
**Category:** Software | **Theme:** Disaster Management

---

## 📌 Project Overview
During monsoon and extreme convective weather events, flash floods and urban inundation cause catastrophic loss of life and critical infrastructure damage across India. Conventional forecasting relies on isolated NWP models or delayed radar observations without synchronized multi-sensor fusion.

This solution provides an **end-to-end, multi-source fusion AI/ML early warning and inundation prediction platform**:
1. **Multi-Source Data Ingestion & Fusion Layer:** Ingests and synchronizes INSAT-3D/3DR satellite imagery, Doppler Weather Radar (DWR) reflectivity (dBZ), Automatic Weather Station (AWS/ARG) telemetry, and Numerical Weather Prediction (NWP) model outputs into a unified spatiotemporal grid.
2. **Dual-Tier ML Prediction Engine:**
   - **Nowcasting Spatiotemporal Engine (ConvLSTM/3D-CNN):** Extrapolates convective storm evolution for 0–6 hour lead time.
   - **Extreme Rainfall Classification Engine (XGBoost):** Classifies station-level rainfall thresholds (>64.5 mm/24h Heavy, >115.5 mm/24h Very Heavy, >204.4 mm/24h Extremely Heavy).
3. **Hydrological Inundation Engine:** Pairs digital elevation models (SRTM DEM) and runoff calculations (SCS-CN) to simulate water spread and flood depth.
4. **IMD Color-Coded Early Warning System:** Automatically aggregates warnings at the district/urban level following standard IMD color protocols (Green, Yellow, Orange, Red).
5. **Interactive Geospatial Web Dashboard:** High-performance GIS dashboard featuring multi-layer toggles, nowcasting time-sliders, district vulnerability stats, and model skill scores (POD, FAR, CSI).

---

## 🏗️ Folder Structure
See detailed architecture documentation in [docs/architecture_overview.md](docs/architecture_overview.md).

```
nlp project/
├── backend/                  # FastAPI REST and GeoJSON API service
├── data/                     # Raw and processed datasets + synthetic data generators
│   ├── raw/                  # Satellite, Radar, AWS, NWP, DEM raw archives
│   ├── processed/            # Harmonized grids & ML tabular feature sets
│   └── synthetic_generators/ # Realistic data simulators for plug-and-play testing
├── docs/                     # Architecture, SIH Pitch, and Demo documentation
├── frontend/                 # Interactive React + Leaflet GIS Web Application
├── inundation_engine/        # SCS-CN runoff & DEM topographic inundation mapper
├── ml_pipeline/              # Ingestion, XGBoost, ConvLSTM nowcasting & evaluation
└── scripts/                  # Automation scripts & data seeding
```

---

## 🚀 Phased Implementation Roadmap & Live Feature Matrix
- [x] **Phase 1: Architecture & Scaffolding:** Scaffold project structure, FastAPI backend, and React GIS frontend.
- [x] **Phase 2: Multi-Source Sensor Ingestion:** Harmonized grids integrating INSAT-3D Satellite IR, Doppler Weather Radar (dBZ), AWS ground telemetry, and Open-Meteo Global NWP.
- [x] **Phase 3: AI/ML Dual-Tier Prediction:** XGBoost extreme rainfall thresholding coupled with 0–6 hr convective nowcasting engine.
- [x] **Phase 4: Hydrological Inundation Modeling:** SCS-CN runoff equations coupled with SRTM 30m Digital Elevation Models (DEM) for flood depth & saucer basin water spread.
- [x] **Phase 5: IMD SOP & WMO Protocol Dual-Engine:** Instant toggle between IMD Standard Operating Procedures (SOP 64.5/115.5/204.4 mm) and WMO International Guidelines.
- [x] **Phase 6: Multi-Channel Dissemination Simulator ("Last-Mile Warning Engine"):** C-DOT Cell Broadcast, bilingual SMS blasts, automated IVR outbound voice calls with Web Speech API audio playback for low-literacy rural users, WhatsApp verified crisis channels, and civil defense sirens.
- [x] **Phase 7: CAP 1.2 (ITU-T X.1303) XML Generator & Exporter:** 1-click generation, clipboard copy, and file download of machine-readable XML compliant with NDMA SACHET, Google Public Alerts, and WMO Alert Hub.
- [x] **Phase 8: High-Ground Designated Relief Shelters & Evacuation Layer:** Interactive GIS layer displaying safe havens mapped above 100-year flood levels with capacity, occupancy, medical triage, and power backup.
- [x] **Phase 9: Dual Persona Views:** Seamless toggle between **Official View (DDMA / IMD Command Center)** and **Citizen View (Public / Vernacular Guidance, Helplines & Ground Reporting)**.
- [x] **Phase 10: Pitch & Presentation Strategy:** Step-by-step judge walkthrough script highlighting Ganges-Brahmaputra-Meghna cross-border basin scalability and UN "Early Warnings for All" (EW4All) 2027 alignment.
