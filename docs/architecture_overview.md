# System Architecture & Folder Layout
## MoES / IMD - AI/ML-Based Integrated Heavy Rainfall Early Warning & Inundation Prediction System (SIH 2026 - ID 26071)

### 1. High-Level Architecture Overview

```
                      +------------------------------------------+
                      |       Heterogeneous Data Sources         |
                      | (INSAT Satellite, DWR Radar, AWS, NWP)   |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |         Data Ingestion & Fusion          |
                      |   - Connectors & Spatial-Temporal Grid   |
                      |   - Quality Assurance & Interpolation    |
                      +------------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
     +-----------------------------+               +-----------------------------+
     |   Tabular ML Engine         |               | Spatiotemporal Nowcasting   |
     | (XGBoost/LightGBM Baseline) |               |  (ConvLSTM / 3D-CNN, 0-6h)  |
     | - Station point rain alerts |               | - 2D Gridded rain intensity |
     +-----------------------------+               +-----------------------------+
                    |                                             |
                    +----------------------+----------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |   Hydrological Inundation Engine         |
                      | - SRTM DEM + Slope + Flow Accumulation   |
                      | - SCS-CN Runoff & Inundation Extent      |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |          IMD Alert Rule Engine           |
                      | (Green / Yellow / Orange / Red Warnings) |
                      |    District-Level Impact Aggregation     |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |         FastAPI REST & GeoJSON API       |
                      |   (/predict, /alerts, /stations, etc.)   |
                      +------------------------------------------+
                                           |
                                           v
                      +------------------------------------------+
                      |     Modern GIS Web Application UI        |
                      | (React + Leaflet + Heatmaps + Forecast)  |
                      +------------------------------------------+
```

---

### 2. Comprehensive Directory Layout

```
nlp project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── alerts.py            # District-level IMD color-coded alerts
│   │   │       │   ├── inundation.py        # Inundation risk & depth GeoJSON layers
│   │   │       │   ├── model_status.py      # System health & verification metrics (POD, FAR, CSI)
│   │   │       │   ├── predict.py           # ML inference (tabular & spatiotemporal)
│   │   │       │   ├── stations.py          # AWS/ARG weather stations live telemetry
│   │   │       │   └── weather_layers.py    # Satellite, Radar dBZ, NWP precipitation grid
│   │   │       └── api.py                  # API router bundling v1 endpoints
│   │   ├── core/
│   │   │   ├── config.py                   # Environment & runtime configurations
│   │   │   └── logging.py                  # Structured logging
│   │   ├── schemas/
│   │   │   ├── alert_schema.py             # Pydantic schemas for warnings and bulletins
│   │   │   ├── forecast_schema.py          # Weather & nowcasting schemas
│   │   │   └── station_schema.py           # AWS sensor telemetry schemas
│   │   ├── services/
│   │   │   ├── alert_service.py            # IMD threshold evaluation logic
│   │   │   ├── gis_service.py              # GeoJSON generation & coordinate transforms
│   │   │   └── prediction_service.py       # Orchestrates ML inference pipelines
│   │   └── main.py                         # FastAPI application entrypoint
│   ├── Dockerfile
│   └── requirements.txt
│
├── data/
│   ├── raw/
│   │   ├── aws_arg/                        # AWS/ARG weather station point sensor logs
│   │   ├── dem/                            # Digital elevation model (SRTM) & drainage
│   │   ├── nwp/                            # NWP model forecasts (GFS / ECMWF proxies)
│   │   ├── radar/                          # Doppler Weather Radar (DWR) reflectivity (dBZ)
│   │   └── satellite/                      # INSAT-3D/3DR cloud imagery / GPM proxies
│   ├── processed/
│   │   ├── spatial_grid/                   # Uniformly gridded spatiotemporal matrices
│   │   └── tabular_features/               # Extracted ML tabular training sets
│   └── synthetic_generators/
│       ├── generate_aws_data.py            # Realistic AWS/ARG telemetry simulator
│       ├── generate_dem_data.py            # Synthetic coastal/river basin topography
│       ├── generate_nwp_data.py            # Gridded NWP model precipitation & wind
│       ├── generate_radar_data.py          # DWR reflectivity storm cell simulator
│       └── generate_satellite_data.py      # INSAT thermal IR / brightness temp simulator
│
├── docs/
│   ├── architecture_overview.md            # High-level architecture & pipeline specs
│   ├── sih_pitch_summary.md                # Hackathon judge pitch deck reference
│   └── demo_walkthrough.md                 # End-to-end evaluation & demo script
│
├── frontend/                               # React + Leaflet interactive early warning GIS dashboard
│   ├── public/
│   └── src/
│
├── inundation_engine/
│   ├── dem_processor.py                    # Elevation profiling, slope, depression mapping
│   ├── runoff_model.py                     # SCS Curve Number (SCS-CN) runoff calculation
│   └── inundation_mapper.py                # Inundation depth & flood polygon generator
│
├── ml_pipeline/
│   ├── evaluation/
│   │   └── metrics.py                      # POD, FAR, CSI, ETS, ROC-AUC calculations
│   ├── ingestion/
│   │   ├── aws_connector.py                # Ingestion connector for AWS/ARG
│   │   ├── fusion_layer.py                 # Resampling & multi-sensor spatio-temporal fusion
│   │   ├── nwp_connector.py                # Ingestion connector for NWP grids
│   │   ├── radar_connector.py              # Ingestion connector for DWR radar
│   │   └── satellite_connector.py          # Ingestion connector for INSAT/GPM
│   ├── models/
│   │   ├── baseline_xgboost/
│   │   │   ├── train.py                    # Tabular extreme rainfall classifier training
│   │   │   └── predict.py                  # Real-time tabular inference
│   │   ├── inundation_unet/
│   │   │   └── unet_model.py               # Deep learning flood extent prediction
│   │   └── nowcasting_convlstm/
│   │       └── convlstm_model.py           # Spatiotemporal 0-6h radar/satellite nowcaster
│   └── saved_models/                       # Trained model checkpoints (.joblib, .pt)
│
├── scripts/                                # Utility orchestration scripts
│   ├── run_all.ps1                         # One-click start script for Windows
│   └── seed_demo_data.py                   # Populates realistic mock scenario data
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

### 3. Key Design Choices & Modular Connectors
- **Plug-and-Play Connectors**: Live IMD/MOSDAC feeds require official access keys. All connectors implement an abstract base class `BaseConnector` that seamlessly switches between synthetic realistic data, NASA/NOAA public mirrors, or live IMD feeds without changing downstream ML code.
- **Two-Tier Modeling Engine**:
  1. *Tabular XGBoost Classifier*: Rapid inference for specific AWS/ARG telemetry stations predicting probability of heavy (>64.5 mm/24h) and very heavy (>115.5 mm/24h) rainfall.
  2. *Spatiotemporal ConvLSTM / 3D-CNN*: 0–6 hour radar reflectivity and satellite cloud-top temperature extrapolation.
- **Hydrological Inundation Coupling**: Seamlessly pairs rain intensity predictions with DEM slope and runoff curve numbers to compute inundation depth and affected infrastructure polygons.
- **IMD Color-Coded Protocols**: Direct adherence to IMD SOPs (Green = No warning, Yellow = Be updated, Orange = Be prepared, Red = Take action).
