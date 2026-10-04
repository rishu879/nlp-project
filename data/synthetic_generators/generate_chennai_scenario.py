"""
Scenario Generator for Chennai Metropolitan Area (Cyclone / Heavy Inundation Scenario)
SIH 2026 Problem Statement ID 26071
"""

import json
import os
import math
import numpy as np

def create_chennai_scenario():
    center = {"lat": 13.0400, "lon": 80.2200}
    
    timesteps = [
        {"step": 0, "label": "06:00 IST", "forecast_hour": "T+0 (Nowcast)", "status": "Cyclone Outer Bands", "description": "Cyclonic spiral rainbands approaching Chennai coast from Bay of Bengal"},
        {"step": 1, "label": "07:00 IST", "forecast_hour": "T+1 hr", "status": "Intense Squalls", "description": "Gale winds and torrential precipitation over coastal Marina and Adyar"},
        {"step": 2, "label": "08:00 IST", "forecast_hour": "T+2 hr", "status": "Heavy Rain Alert", "description": "Sustained convective bands over Chembarambakkam catchment and Velachery"},
        {"step": 3, "label": "09:00 IST", "forecast_hour": "T+3 hr", "status": "Peak Deluge & Surge", "description": "Adyar river overflowing bankfull discharge; severe inundation in low-lying basins"},
        {"step": 4, "label": "10:00 IST", "forecast_hour": "T+4 hr", "status": "Widespread Inundation", "description": "Water logging in Velachery, Mudichur, and Tambaram reaching critical thresholds"},
        {"step": 5, "label": "11:00 IST", "forecast_hour": "T+5 hr", "status": "System Moving North", "description": "Main rain core tracking toward Pulicat lake; relief and dewatering operations begin"}
    ]

    base_stations = [
        {"id": "AWS-CHN-01", "name": "Meenambakkam IMD Airport", "lat": 12.9941, "lon": 80.1709, "elevation_m": 16.0, "district": "Chennai South"},
        {"id": "AWS-CHN-02", "name": "Nungambakkam IMD Observatory", "lat": 13.0640, "lon": 80.2440, "elevation_m": 8.0, "district": "Chennai Central"},
        {"id": "AWS-CHN-03", "name": "Velachery Marshland AWS", "lat": 12.9815, "lon": 80.2180, "elevation_m": 3.1, "district": "Chennai South"},
        {"id": "AWS-CHN-04", "name": "Adyar Estuary ARG", "lat": 13.0067, "lon": 80.2570, "elevation_m": 2.5, "district": "Chennai South"},
        {"id": "AWS-CHN-05", "name": "Tambaram Sanatorium AWS", "lat": 12.9249, "lon": 80.1000, "elevation_m": 24.0, "district": "Chengalpattu"},
        {"id": "AWS-CHN-06", "name": "Chembarambakkam Catchment ARG", "lat": 13.0110, "lon": 80.0520, "elevation_m": 26.0, "district": "Kanchipuram"},
        {"id": "AWS-CHN-07", "name": "Madhavaram AWS", "lat": 13.1480, "lon": 80.2310, "elevation_m": 12.0, "district": "Chennai North"},
        {"id": "AWS-CHN-08", "name": "Royapuram Harbour ARG", "lat": 13.1140, "lon": 80.2940, "elevation_m": 4.0, "district": "Chennai North"}
    ]

    station_profiles = {
        "AWS-CHN-01": {"rain_rate": [9.0, 36.0, 84.0, 125.0, 72.0, 20.0], "temp": [28.5, 26.8, 24.5, 23.5, 24.0, 24.8], "humidity": [85, 92, 97, 100, 98, 95], "pressure": [1002.0, 998.5, 993.0, 989.5, 992.0, 996.0], "wind": [28, 45, 65, 82, 54, 32]},
        "AWS-CHN-02": {"rain_rate": [14.0, 48.0, 75.0, 110.0, 58.0, 18.0], "temp": [28.2, 26.5, 24.8, 23.8, 24.2, 25.0], "humidity": [88, 94, 98, 99, 97, 94], "pressure": [1001.5, 997.8, 992.2, 988.8, 991.5, 995.5], "wind": [32, 52, 74, 90, 60, 38]},
        "AWS-CHN-03": {"rain_rate": [12.0, 52.0, 98.0, 138.0, 84.0, 25.0], "temp": [28.0, 26.2, 24.0, 23.2, 23.8, 24.5], "humidity": [89, 95, 99, 100, 99, 96], "pressure": [1001.8, 998.0, 992.5, 989.0, 991.8, 995.8], "wind": [30, 48, 70, 88, 56, 35]},
        "AWS-CHN-04": {"rain_rate": [16.0, 55.0, 80.0, 105.0, 50.0, 15.0], "temp": [27.9, 26.4, 24.9, 24.1, 24.5, 25.2], "humidity": [90, 96, 98, 99, 96, 93], "pressure": [1001.2, 997.5, 992.0, 988.4, 991.0, 995.2], "wind": [35, 58, 80, 95, 65, 40]},
        "AWS-CHN-05": {"rain_rate": [6.0, 25.0, 64.0, 95.0, 65.0, 22.0], "temp": [28.8, 27.1, 25.0, 24.0, 24.4, 25.1], "humidity": [83, 90, 95, 98, 97, 94], "pressure": [1002.5, 999.0, 993.8, 990.2, 992.8, 996.5], "wind": [22, 38, 55, 72, 48, 28]},
        "AWS-CHN-06": {"rain_rate": [8.0, 32.0, 72.0, 118.0, 88.0, 30.0], "temp": [28.6, 26.9, 24.6, 23.6, 24.1, 24.9], "humidity": [84, 91, 96, 99, 98, 95], "pressure": [1002.2, 998.8, 993.5, 989.8, 992.4, 996.2], "wind": [24, 40, 58, 75, 50, 30]},
        "AWS-CHN-07": {"rain_rate": [7.0, 22.0, 50.0, 78.0, 82.0, 38.0], "temp": [28.9, 27.3, 25.4, 24.4, 24.2, 24.8], "humidity": [82, 88, 94, 97, 98, 95], "pressure": [1002.8, 999.4, 994.2, 990.8, 992.6, 996.8], "wind": [25, 42, 60, 76, 58, 34]},
        "AWS-CHN-08": {"rain_rate": [15.0, 42.0, 68.0, 92.0, 74.0, 28.0], "temp": [28.1, 26.6, 25.1, 24.2, 24.4, 25.1], "humidity": [89, 95, 97, 98, 97, 94], "pressure": [1001.4, 997.7, 992.3, 988.6, 991.2, 995.4], "wind": [34, 55, 78, 92, 64, 38]}
    }

    stations_by_step = []
    for step_idx in range(6):
        step_stations = []
        for s in base_stations:
            sid = s["id"]
            prof = station_profiles[sid]
            rain_rate = prof["rain_rate"][step_idx]
            accum = sum(prof["rain_rate"][:step_idx+1])
            
            if rain_rate >= 100:
                imd_alert = "Red"
                rain_category = "Extremely Heavy / Cyclone Deluge"
            elif rain_rate >= 50:
                imd_alert = "Orange"
                rain_category = "Very Heavy"
            elif rain_rate >= 15:
                imd_alert = "Yellow"
                rain_category = "Moderate to Heavy"
            else:
                imd_alert = "Green"
                rain_category = "Light / Moderate"
                
            step_stations.append({
                "id": sid,
                "name": s["name"],
                "lat": s["lat"],
                "lon": s["lon"],
                "elevation_m": s["elevation_m"],
                "district": s["district"],
                "rain_rate_mmhr": rain_rate,
                "accum_rainfall_mm": round(accum, 1),
                "temperature_c": prof["temp"][step_idx],
                "humidity_pct": prof["humidity"][step_idx],
                "pressure_hpa": prof["pressure"][step_idx],
                "wind_speed_kmh": prof["wind"][step_idx],
                "wind_direction": "NE" if step_idx < 3 else "ENE",
                "rain_category": rain_category,
                "alert_level": imd_alert,
                "quality_flag": "PASSED_QC"
            })
        stations_by_step.append(step_stations)

    # Grid for Chennai (8x8)
    lat_min, lat_max = 12.90, 13.20
    lon_min, lon_max = 80.05, 80.32
    grid_rows, grid_cols = 10, 8
    lats = np.linspace(lat_min, lat_max, grid_rows)
    lons = np.linspace(lon_min, lon_max, grid_cols)

    cyclone_centers = [
        {"lat": 12.92, "lon": 80.35, "max_rain": 35.0, "sigma": 0.09},
        {"lat": 12.98, "lon": 80.28, "max_rain": 75.0, "sigma": 0.08},
        {"lat": 13.02, "lon": 80.23, "max_rain": 115.0, "sigma": 0.07},
        {"lat": 13.04, "lon": 80.20, "max_rain": 140.0, "sigma": 0.065}, # Peak over Adyar / Velachery
        {"lat": 13.12, "lon": 80.18, "max_rain": 98.0, "sigma": 0.07},
        {"lat": 13.20, "lon": 80.16, "max_rain": 50.0, "sigma": 0.09}
    ]

    grids_by_step = []
    for step_idx, center_info in enumerate(cyclone_centers):
        step_grid = []
        c_lat = center_info["lat"]
        c_lon = center_info["lon"]
        max_r = center_info["max_rain"]
        sigma = center_info["sigma"]
        
        for r_idx, lat in enumerate(lats):
            for c_idx, lon in enumerate(lons):
                dist_sq = ((lat - c_lat) ** 2) + (((lon - c_lon) * math.cos(math.radians(13.0))) ** 2)
                intensity = max_r * math.exp(-dist_sq / (2 * (sigma ** 2)))
                rain_rate = round(float(intensity + 8.0), 1)

                if rain_rate > 0.1:
                    z_val = 200.0 * (rain_rate ** 1.6)
                    dbz = round(float(10.0 * math.log10(z_val)), 1)
                else:
                    dbz = 15.0

                brightness_temp_k = round(float(270.0 - (min(rain_rate, 150.0) / 150.0) * 75.0), 1)
                nwp_rain = round(float(rain_rate * 0.85 + 5.0), 1)
                
                # Lowlands in Velachery marsh and Pallikaranai
                is_marsh = (12.94 <= lat <= 13.02 and 80.18 <= lon <= 80.25)
                elevation_approx = 3.0 if is_marsh else 15.0

                if rain_rate > 80 and elevation_approx < 5:
                    inundation_risk = "Severe / Critical"
                    flood_depth_cm = round(40.0 + (rain_rate - 80) * 0.9, 1)
                elif rain_rate > 45 and elevation_approx < 8:
                    inundation_risk = "High"
                    flood_depth_cm = round(18.0 + (rain_rate - 45) * 0.6, 1)
                elif rain_rate > 20 and elevation_approx < 12:
                    inundation_risk = "Moderate"
                    flood_depth_cm = round(6.0 + (rain_rate - 20) * 0.25, 1)
                else:
                    inundation_risk = "Low / None"
                    flood_depth_cm = 0.0

                step_grid.append({
                    "cell_id": f"GRID_{r_idx}_{c_idx}",
                    "lat": round(float(lat), 4),
                    "lon": round(float(lon), 4),
                    "rainfall_intensity_mmhr": rain_rate,
                    "radar_reflectivity_dbz": min(dbz, 65.0),
                    "satellite_brightness_temp_k": brightness_temp_k,
                    "nwp_forecast_rain_mmhr": nwp_rain,
                    "elevation_m": elevation_approx,
                    "inundation_risk": inundation_risk,
                    "flood_depth_cm": flood_depth_cm
                })
        grids_by_step.append(step_grid)

    elevation_zones = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": "CHN_ELEV_LOW_01",
                    "name": "Pallikaranai Marsh & Velachery Basin",
                    "elevation_category": "Low (< 5m MSL)",
                    "avg_elevation_m": 2.8,
                    "slope_pct": 0.2,
                    "hydrology": "Natural floodplain & saltwater wetland",
                    "vulnerability": "Extreme urban flood sink"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [80.190, 12.940], [80.235, 12.940], [80.245, 13.010],
                        [80.200, 13.010], [80.190, 12.940]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "CHN_ELEV_LOW_02",
                    "name": "Adyar River Basin & Saidapet Outfall",
                    "elevation_category": "Low (< 5m MSL)",
                    "avg_elevation_m": 3.4,
                    "slope_pct": 0.3,
                    "hydrology": "Tidal locked river corridor",
                    "vulnerability": "Severe backwater flooding"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [80.170, 13.000], [80.265, 13.000], [80.265, 13.025],
                        [80.170, 13.025], [80.170, 13.000]
                    ]]
                }
            }
        ]
    }

    historical_flood_zones = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "id": "CHN_FLOOD_01",
                    "zone_name": "Velachery Residential Wetland Bowl",
                    "historical_record": "Submerged in 2015 (490mm), 2021 (210mm), 2023 Michaung (450mm)",
                    "max_recorded_depth_m": 2.4,
                    "critical_assets": ["Velachery MRTS Station", "Inner Ring Road", "Apollo Proton Hospital Access"],
                    "drainage_capacity_mmhr": 20.0,
                    "population_at_risk": 320000
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [80.205, 12.965], [80.230, 12.965], [80.232, 12.990],
                        [80.208, 12.990], [80.205, 12.965]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "id": "CHN_FLOOD_02",
                    "zone_name": "Mudichur - Tambaram Adyar Headwaters",
                    "historical_record": "Up to 3m water during surplus release from Chembarambakkam reservoir",
                    "max_recorded_depth_m": 3.1,
                    "critical_assets": ["GST National Highway 45", "Tambaram Railway Terminus", "Madras Christian College Link"],
                    "drainage_capacity_mmhr": 18.0,
                    "population_at_risk": 210000
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [80.080, 12.905], [80.120, 12.905], [80.122, 12.935],
                        [80.082, 12.935], [80.080, 12.905]
                    ]]
                }
            }
        ]
    }

    districts = [
        {
            "id": "CHN_DIST_01",
            "name": "Chennai South (Velachery / Adyar / Guindy)",
            "center": [12.985, 12.220],
            "area_sqkm": 210.0,
            "population_millions": 4.1,
            "alerts": ["Green", "Yellow", "Orange", "Red", "Red", "Orange"],
            "max_rain_by_step": [16.0, 55.0, 98.0, 138.0, 84.0, 25.0],
            "lead_time_by_step": ["5 hr to onset", "3 hr to peak", "1 hr to peak", "IMMEDIATE (Peak Event)", "Ongoing Flood Peaking", "Water Receding"],
            "action_bulletin": [
                "Pre-cyclone preparedness. Water bodies at 60% capacity.",
                "Yellow Watch: Rain bands moving inland from Bay of Bengal.",
                "Orange Alert: Heavy showers sustained. Open floodgates under controlled protocol.",
                "RED ALERT: TAKE ACTION! Severe Cyclonic Deluge. Low-lying areas inundated up to 2m.",
                "RED ALERT: Continued storm surge preventing Adyar river sea outfall.",
                "Orange Watch: Precipitation easing, army & SDRF motorboats deployed."
            ]
        },
        {
            "id": "CHN_DIST_02",
            "name": "Chennai Central (Nungambakkam / Marina / Egmore)",
            "center": [13.060, 80.240],
            "area_sqkm": 140.0,
            "population_millions": 3.2,
            "alerts": ["Green", "Yellow", "Orange", "Orange", "Yellow", "Green"],
            "max_rain_by_step": [14.0, 48.0, 75.0, 110.0, 58.0, 18.0],
            "lead_time_by_step": ["4 hr to peak", "2 hr to peak", "30 min to peak", "Heavy Rain Ongoing", "Easing", "Normalizing"],
            "action_bulletin": [
                "Normal coastal conditions.",
                "Yellow Watch: High velocity squalls along Marina beach promenade.",
                "Orange Alert: Waterlogging at Central station subways and Poonamallee High Road.",
                "Orange Alert: Cooum river rising. Evacuate hutments along riverbanks.",
                "Yellow Watch: Rain reducing in intensity.",
                "Green Watch: System departing northward."
            ]
        }
    ]

    model_verification_stats = {
        "model_name": "IMD-DeepCast Ensemble (Cyclone Specialized ConvLSTM + SCS-CN Hydrology)",
        "lead_time_hours": "0 - 6 Hours",
        "spatial_resolution": "500m x 500m Gridded Mesh",
        "probability_of_detection_pod": 0.908,
        "false_alarm_ratio_far": 0.124,
        "critical_success_index_csi": 0.805,
        "equitable_threat_score_ets": 0.742,
        "receiver_operating_characteristic_auc": 0.956,
        "input_heterogeneous_sensors": [
            {"sensor": "INSAT-3D/3DR Satellite", "band": "Thermal IR & Water Vapor", "cadence": "15 min", "status": "LIVE SIMULATED"},
            {"sensor": "Doppler Weather Radar (DWR Chennai Port)", "band": "S-Band Reflectivity (dBZ)", "cadence": "10 min", "status": "LIVE SIMULATED"},
            {"sensor": "AWS / ARG Surface Network", "parameters": "Rain Rate, Temp, RH, Pressure, Wind", "cadence": "5 min", "status": "LIVE SIMULATED"},
            {"sensor": "Numerical Weather Prediction (NWP)", "model": "NCMRWF / IMD GFS Ensemble", "cadence": "Hourly", "status": "LIVE SIMULATED"},
            {"sensor": "SRTM Digital Elevation Model", "resolution": "30m High-Res Topo", "cadence": "Static Hydrology", "status": "COUPLED"}
        ]
    }

    return {
        "city": "Chennai Metropolitan Area (CMA)",
        "center": center,
        "zoom": 11,
        "scenario_title": "Severe Cyclonic Inundation & Adyar Basin Flood Surge",
        "description": "Simulation of severe cyclonic precipitation bands over Chennai with Adyar/Cooum river backwater tidal lock.",
        "timesteps": timesteps,
        "stations_by_step": stations_by_step,
        "grids_by_step": grids_by_step,
        "elevation_zones": elevation_zones,
        "historical_flood_zones": historical_flood_zones,
        "districts": districts,
        "model_verification_stats": model_verification_stats
    }

if __name__ == "__main__":
    scenario = create_chennai_scenario()
    out_dir_1 = r"c:\Users\dankr\Desktop\nlp project\data\processed"
    out_dir_2 = r"c:\Users\dankr\Desktop\nlp project\frontend\src\data"
    os.makedirs(out_dir_1, exist_ok=True)
    os.makedirs(out_dir_2, exist_ok=True)
    file_path_1 = os.path.join(out_dir_1, "chennai_scenario.json")
    file_path_2 = os.path.join(out_dir_2, "chennai_scenario.json")
    with open(file_path_1, "w", encoding="utf-8") as f:
        json.dump(scenario, f, indent=2)
    with open(file_path_2, "w", encoding="utf-8") as f:
        json.dump(scenario, f, indent=2)
    print(f"Chennai scenario generated: {file_path_1}")
