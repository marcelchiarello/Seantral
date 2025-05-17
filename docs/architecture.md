# Seantral Platform Architecture

This document outlines the architecture of the Seantral Platform, a system for high-resolution, near-real-time information on coastal and open-water conditions.

## System Overview

Seantral is a full-stack application with a modular, microservices-based architecture. It consists of:

1. **Data Ingestion & ETL Pipelines**: Python-based services that fetch and process data from various sources.
2. **Data Lake**: Storage for processed data in parquet format.
3. **API Layer**: FastAPI service providing RESTful endpoints for data access.
4. **Web Dashboard**: Next.js application with interactive visualizations.
5. **Authentication & User Management**: Managed by Supabase.

## Architecture Diagram

```mermaid
graph TD
    A[Open Data Sources<br>Copernicus, NOAA] -->|Scheduled Batch| B[Ingestion & ETL<br>Python]
    B -->|Parquet| C[Data Lake<br>S3/DuckDB]
    D[Proprietary Beacons] -.->|Future| B
    C --> E[Analytics & ML Ops<br>SageMaker/K8s Jobs]
    C --> F[FastAPI<br>Time Series & Alerts]
    F --> G[Next.js API Layer]
    E -.->|Predictions| G
    G --> H[Web Dashboard<br>MapLibre + Plotly]
    I[Supabase<br>Auth & Storage] --> G
    I --> H
```

## Component Details

### Data Ingestion & ETL (Python)

- **Copernicus Marine (CMEMS)** - Surface temperature, salinity, currents
- **NOAA NDBC** - Buoy data including wave height, wind, air/water temp
- **Future: Proprietary Beacons** - Telemetry from custom hardware

Data is normalized to a standard format with ISO-19115 metadata and stored as columnar parquet files.

```mermaid
graph TD
    A[Scheduler<br>Hourly/Daily] --> B[Fetch<br>Raw Data]
    B --> C[Transform<br>Normalize & Clean]
    C --> D[Load<br>Parquet/DuckDB]
    D --> E[Metadata Catalog]
```

### API Layer (FastAPI)

The API provides standardized access to the data lake with endpoints for:

- `/v1/timeseries` - Time series data for a location
- `/v1/alerts` - Alert rules and triggered alerts

```mermaid
graph LR
    A[Client] --> B[API Gateway]
    B --> C[Authentication<br>Supabase JWT]
    C --> D[Time Series API]
    C --> E[Alerts API]
    D --> F[Query Engine<br>DuckDB]
    E --> G[Rules Engine]
    F --> H[Data Lake]
    G --> H
```

### Web Application (Next.js 15)

The web application provides an interactive dashboard with:

- MapLibre GL for spatial visualization
- Plotly for time series charts
- Real-time alerts and notifications

```mermaid
graph TD
    A[Next.js App Router] --> B[Authentication<br>Supabase]
    A --> C[Dashboard Page]
    C --> D[Map Component<br>MapLibre GL]
    C --> E[Chart Component<br>Plotly]
    C --> F[Alerts Panel]
    D --> G[API Client]
    E --> G
    F --> G
    G --> H[API Endpoints]
```

## Deployment Architecture

The system is deployed using a serverless approach:

- **Web**: Vercel (edge-optimized)
- **API**: Railway or AWS Fargate
- **Data Lake**: S3 Standard-IA with versioning
- **ETL Jobs**: AWS Lambda / Step Functions

```mermaid
graph TD
    A[GitHub Repository] --> B[CI/CD<br>GitHub Actions]
    B --> C[Vercel<br>Web Frontend]
    B --> D[Railway<br>API Service]
    B --> E[AWS<br>ETL Pipeline]
    E --> F[S3<br>Data Lake]
    D --> F
    G[CloudWatch<br>Alarms] --> E
    H[IAM<br>Permissions] --> E
    H --> F
```

## Authentication & Authorization

Authentication is handled by Supabase, which provides:

- JWT-based authentication
- Row-level security for data access
- OAuth integrations

## Data Flow

1. **Ingestion**: Raw data is fetched from sources on scheduled intervals
2. **Processing**: Data is normalized, cleaned, and enriched
3. **Storage**: Processed data is stored in the data lake
4. **Access**: API endpoints provide access to the data
5. **Visualization**: Web dashboard displays the data with interactive visualizations

## Scalability & Performance

- Edge API caching for high-traffic endpoints
- Columnar storage for efficient time series queries
- Serverless functions that auto-scale based on load
- Incremental builds via Turborepo for fast CI/CD

## Security Considerations

- All secrets stored in environment variables
- HTTPS/TLS for all communication
- JWT tokens for authentication
- Row-level security for data access
- Regular security scans via CodeQL

## Future Expansion

- LLM assistant for natural language queries
- Proprietary beacon integration
- Advanced analytics and forecasting
- Mobile application

## Technology Stack Summary

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Web Frontend | Next.js 15 / React 19 | Modern React with SSR/ISR capabilities |
| UI Components | Tailwind CSS 4 | Utility-first CSS for rapid development |
| Maps | MapLibre GL JS | Open-source maps without vendor lock-in |
| Charts | Plotly.js | Scientific-grade visualization |
| API | FastAPI | High-performance, type-safe API framework |
| Data Lake | S3 + DuckDB | Serverless, columnar storage for analytics |
| Authentication | Supabase | Batteries-included auth with PostgreSQL |
| CI/CD | GitHub Actions | Integrated with repository |
| Monorepo | pnpm + Turborepo | Efficient build caching and workspace management | 