"""Simple script to test the API endpoints."""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"  # Default FastAPI port

def test_root_endpoint():
    """Test the root endpoint."""
    response = requests.get(f"{BASE_URL}/")
    print("Root endpoint response:", response.status_code)
    print(response.json())
    print()

def test_timeseries_endpoint():
    """Test the timeseries endpoint."""
    # Current time
    now = datetime.now()
    # One day ago
    one_day_ago = now - timedelta(days=1)
    
    params = {
        "variable": "sst",
        "lat": 43.25,
        "lon": -70.5,
        "start_time": one_day_ago.isoformat(),
        "end_time": now.isoformat()
    }
    
    response = requests.get(f"{BASE_URL}/v1/timeseries", params=params)
    print("Timeseries endpoint response:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print(f"Data points: {len(data['data'])}")
        print(f"First point: {data['data'][0]}")
        print(f"Last point: {data['data'][-1]}")
    else:
        print("Error:", response.text)
    print()

def test_alerts_endpoint():
    """Test the alerts endpoint."""
    params = {
        "user_id": "test_user"
    }
    
    response = requests.get(f"{BASE_URL}/v1/alerts", params=params)
    print("Alerts endpoint response:", response.status_code)
    if response.status_code == 200:
        data = response.json()
        print(f"Number of alerts: {len(data)}")
        print("Alert details:")
        print(json.dumps(data, indent=2))
    else:
        print("Error:", response.text)
    print()

if __name__ == "__main__":
    print("Testing API endpoints...")
    test_root_endpoint()
    test_timeseries_endpoint()
    test_alerts_endpoint()
    print("API tests completed.") 