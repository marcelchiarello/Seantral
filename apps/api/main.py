"""Main FastAPI application for Seantral API."""

import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

import pandas as pd
import numpy as np

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Seantral API",
    description="API for Seantral coastal and marine data platform",
    version="0.0.1",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Update with proper origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class TimeSeriesPoint(BaseModel):
    """A single point in a time series."""
    
    timestamp: datetime
    value: float
    unit: str = Field(..., description="Unit of measurement")
    
class TimeSeriesResponse(BaseModel):
    """Response for time series data."""
    
    data: List[TimeSeriesPoint]
    source: str = Field(..., description="Data source")
    variable: str = Field(..., description="Variable name")
    location: Dict[str, float] = Field(..., description="Location coordinates")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class AlertRule(BaseModel):
    """Alert rule definition."""
    
    id: str
    variable: str
    threshold: float
    operator: str = Field(..., description="gt, lt, eq, gte, lte")
    duration: Optional[int] = Field(None, description="Duration in minutes")
    location: Dict[str, float]
    active: bool = True
    
class AlertResponse(BaseModel):
    """Response for alert data."""
    
    id: str
    rule: AlertRule
    triggered_at: datetime
    value: float
    status: str = Field(..., description="active, acknowledged, resolved")

# Routes
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Seantral API", "version": "0.0.1"}

@app.get("/v1/timeseries", response_model=TimeSeriesResponse)
async def get_timeseries(
    variable: str = Query(..., description="Variable to query"),
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    start_time: datetime = Query(..., description="Start time"),
    end_time: datetime = Query(..., description="End time"),
    source: Optional[str] = Query(None, description="Data source"),
):
    """Get time series data for a location."""
    # TODO: Implement actual data retrieval from storage
    
    # Mock response for now
    hours = int((end_time - start_time).total_seconds() / 3600) + 1
    timestamps = [start_time + timedelta(hours=i) for i in range(hours)]
    
    if variable == "sst":
        # Sea surface temperature
        values = [20 + 2 * np.sin(i / 24 * 2 * np.pi) + np.random.normal(0, 0.5) for i in range(hours)]
        unit = "°C"
        source = source or "CMEMS"
    elif variable == "wave_height":
        # Wave height
        values = [1.5 + 1 * np.sin(i / 12 * 2 * np.pi) + np.random.normal(0, 0.3) for i in range(hours)]
        unit = "m"
        source = source or "NDBC"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported variable: {variable}")
    
    data = [
        TimeSeriesPoint(timestamp=ts, value=val, unit=unit)
        for ts, val in zip(timestamps, values)
    ]
    
    return TimeSeriesResponse(
        data=data,
        source=source,
        variable=variable,
        location={"lat": lat, "lon": lon},
        metadata={
            "resolution": "hourly",
            "quality": "good",
        },
    )

@app.get("/v1/alerts", response_model=List[AlertResponse])
async def get_alerts(
    user_id: str = Query(..., description="User ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """Get alerts for a user."""
    # TODO: Implement actual alert retrieval from database
    
    # Mock response for now
    alerts = [
        AlertResponse(
            id="alert-001",
            rule=AlertRule(
                id="rule-001",
                variable="sst",
                threshold=25.0,
                operator="gt",
                duration=60,
                location={"lat": 43.25, "lon": -70.5},
            ),
            triggered_at=datetime.now() - timedelta(hours=3),
            value=25.8,
            status="active",
        ),
        AlertResponse(
            id="alert-002",
            rule=AlertRule(
                id="rule-002",
                variable="wave_height",
                threshold=3.0,
                operator="gt",
                duration=None,
                location={"lat": 43.25, "lon": -70.5},
            ),
            triggered_at=datetime.now() - timedelta(days=1),
            value=3.5,
            status="resolved",
        ),
    ]
    
    if status:
        alerts = [a for a in alerts if a.status == status]
    
    return alerts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001) 