PRODUCT REQUIREMENTS DOCUMENT (PRD)
1. Overview
Product Name (working):
GeoSafe Map — An interactive platform that visualizes volcanoes, earthquakes, and other natural hazards in real time, combining scientific data with contextual analytics for public awareness, planning, and disaster resilience.
Tagline:
“All hazards. One map. Real-time awareness for safer communities.”
Vision:
To build an open, data-driven platform that unifies multiple hazard data sources (earthquake, volcano, flood, landslide, typhoon, etc.) into a single visual and analytical environment — empowering citizens, responders, and policymakers to make informed, timely decisions.
2. Problem Statement
People in hazard-prone countries (e.g., the Philippines) face multiple overlapping threats — earthquakes, volcanic eruptions, floods, and typhoons — yet public tools show them individually.
There is no single platform that:
Unifies hazard data sources into one map,
Updates in real time, and
Provides contextual, actionable information (population exposure, safe zones, alerts).
As a result:
Citizens lack situational awareness.
Local governments rely on scattered data.
Researchers must manually collect and merge datasets.
3. Goals & Objectives
Primary Goals
Centralize multiple hazard datasets into a unified, visual, and queryable map.
Provide real-time alerts for seismic and volcanic events.
Overlay contextual data (population, hazard zones, weather, infrastructure).
Support decision-making for public users, LGUs, and researchers.
Enable future AI/ML analytics for predictive modeling and risk scoring.
Secondary Goals
Offer APIs / data services for developers and researchers.
Encourage transparency and public trust in science-based alerts.
Build regional resilience by expanding coverage to ASEAN / Pacific.
4. Target Users & Use Cases
User Segment	Use Case
Citizens / Public	View nearby hazards, receive alerts, check safe zones, share reports
Local Governments (LGUs)	Monitor multi-hazard exposure, plan evacuations, assess damage
Disaster Agencies (e.g., NDRRMC)	Unified situational dashboard for coordination
Researchers / NGOs	Data access via API for analytics and modeling
Schools / Communities	Educational tool for awareness and preparedness
5. Key Features (MVP → Future Roadmap)
🧩 Phase 1: Core MVP (3–6 months)
Hazards Covered: Earthquakes + Volcanoes
Features:
🌋 Real-time volcano activity map (PHIVOLCS + GVP + USGS)
🌎 Real-time earthquake visualization (USGS + PHIVOLCS)
📍 Interactive map (zoom, filter by date, magnitude, location)
🔔 Push notifications (magnitude, radius-based)
🧾 Event details: depth, location, magnitude, intensity, affected population
🗺 Base layers: population density, administrative boundaries
🛰 API integration and caching (PostGIS backend, hourly sync)
📱 Mobile-friendly Progressive Web App (PWA)
⚡️ Phase 2: Enhanced Hazards (6–12 months)
Add: Flood, landslide, tsunami, typhoon layers
Features:
🌧 Real-time rainfall & typhoon overlays (PAGASA / NASA GPM)
🌊 Flood hazard zones & historical flood extent maps
🪨 Landslide & lahar hazard zones (PHIVOLCS / MGB)
🚨 Combined “Hazard Intensity Index” visualization (multi-layer overlay)
🗺 Saved views & user subscriptions per region
🔮 Phase 3: Analytics & Forecasting (12–18 months)
Add: Risk analytics and early warning logic
Features:
📊 Multi-hazard exposure index (population × hazard intensity)
🤖 AI-based anomaly detection for volcanic unrest / seismic clusters
🧮 Evacuation route analysis (safe path computation)
🧱 Infrastructure exposure dashboard (roads, hospitals, schools)
🌡 Weather + hazard correlation (rainfall-triggered lahar/flood prediction)
🌐 Phase 4: Regional Expansion + API Product (18+ months)
🌏 Extend coverage to entire ASEAN + Pacific Ring of Fire
🧰 Launch developer API / SDK for hazard data access
💼 Enterprise dashboard for insurers, logistics, utilities
6. Data Sources
Data Type	Source	Access
Earthquakes	USGS GeoJSON Feed, PHIVOLCS Earthquake Info	REST API / Scraping
Volcanoes	USGS Volcano API, Smithsonian GVP, PHIVOLCS Bulletins	REST / HTML Parse
Hazard Zones	PHIVOLCS Geoportal, MGB Geohazards	WMS / Shapefile / ArcGIS REST
Population	WorldPop, PSA, Meta Data for Good	Raster / GeoTIFF
Rainfall / Typhoon	PAGASA, NASA GPM, JTWC	API / GeoTIFF
Elevation	NASA SRTM / Copernicus DEM	Open data
Infrastructure	OpenStreetMap	OSM Overpass API
InSAR / Deformation	ESA Sentinel-1	Download (optional future integration)
7. Architecture Overview
Frontend:
React + Leaflet / Mapbox GL for map UI
Tailwind CSS + Mapbox styles
PWA support (offline + push notifications)
Backend:
Node.js or FastAPI (Python) for API aggregation
PostGIS for geospatial data
Redis for caching / event queue
Serverless (AWS Lambda / Fargate) for ingestion jobs
Data Pipeline:
Fetch → Normalize → Store → Serve → Visualize
Scheduled sync with fallback for offline feeds
8. KPIs / Success Metrics
Metric	Target
Average API latency	< 1 sec
Data update frequency	≤ 5 min for quakes, ≤ 1 hr for volcanoes
Monthly Active Users (MAU)	50K in pilot, 500K in year 1
Regional coverage	100% of PH hazard zones by year 1
Data uptime	99.5%
API calls per day	100K+ by year 2
9. Monetization Strategy
Model	Description
Freemium Public App	Free access to core map, ads optional
Pro Dashboard (B2G / B2B)	Analytics + reports for LGUs, insurance, utilities
API Subscription	Hazard data access for developers / researchers
Grants / Partnerships	Gov’t, NGOs, academic funding (e.g. DOST, UNDRR)
10. Risks & Mitigation
Risk	Mitigation
PHIVOLCS feed changes / downtime	Cache data, use USGS fallback
API rate limits	Use internal mirroring & throttling
Public misinterpretation of alerts	Include official source & disclaimer
Map performance on mobile	Implement clustering & vector tiles
Data licensing conflicts	Use only open/public datasets, request MOU for PHIVOLCS
11. Future Vision
“A single open-source platform for hazard awareness, analytics, and early warning across Southeast Asia.”
Imagine citizens opening one map and instantly seeing:
Real-time hazards
Predicted impact zones
Safe routes & shelters
Verified data from official agencies
This platform could become the “National Digital Twin for Disaster Resilience”, bridging public science and civic technology.
