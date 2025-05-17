"""Client for interacting with the NOAA National Data Buoy Center."""

import os
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timedelta
import concurrent.futures

import pandas as pd
import httpx
from loguru import logger

class NDBCClient:
    """Client for downloading data from NOAA NDBC."""
    
    BASE_URL = "https://www.ndbc.noaa.gov/data/"
    
    def __init__(
        self,
        output_dir: Optional[Path] = None,
        timeout: int = 30,
        max_workers: int = 5,
    ):
        """Initialize NDBC client.
        
        Args:
            output_dir: Directory for downloaded files
            timeout: Request timeout in seconds
            max_workers: Maximum number of concurrent downloads
        """
        self.output_dir = output_dir or Path(tempfile.gettempdir()) / "ndbc"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.timeout = timeout
        self.max_workers = max_workers
        
    def download_buoy_data(
        self,
        buoy_id: str,
        year: Optional[int] = None,
        month: Optional[int] = None,
        data_type: str = "stdmet",
    ) -> Path:
        """Download data for a specific buoy.
        
        Args:
            buoy_id: Buoy identifier (e.g., '46013')
            year: Year to download (None for current year)
            month: Month to download (None for current month)
            data_type: Type of data to download
                       Options: stdmet, adcp, adcp2, cwind, dart, mmbcur, ocean, specs, wlevel
                       
        Returns:
            Path to downloaded file
        """
        now = datetime.now()
        year = year or now.year
        month = month or now.month
        
        # Determine URL and filename based on parameters
        if month is not None:
            # Monthly data
            url = f"{self.BASE_URL}{data_type}/{month:02d}/{buoy_id}_{data_type}.txt"
            filename = f"{buoy_id}_{data_type}_{year}_{month:02d}.txt"
        else:
            # Annual data
            url = f"{self.BASE_URL}{data_type}/hist/{buoy_id}_{data_type}h{year}.txt"
            filename = f"{buoy_id}_{data_type}_{year}.txt"
        
        output_file = self.output_dir / filename
        
        try:
            logger.info(f"Downloading {buoy_id} data from NDBC: {url}")
            with httpx.Client(timeout=self.timeout) as client:
                response = client.get(url)
                response.raise_for_status()
                
                with open(output_file, "wb") as f:
                    f.write(response.content)
                    
            logger.success(f"Successfully downloaded {buoy_id} data to {output_file}")
            return output_file
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error downloading {buoy_id} data: {e}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Request error downloading {buoy_id} data: {e}")
            raise
    
    def parse_buoy_data(self, file_path: Path) -> pd.DataFrame:
        """Parse NDBC buoy data file into a DataFrame.
        
        Args:
            file_path: Path to data file
            
        Returns:
            DataFrame with parsed data
        """
        try:
            # Read the data file, skipping comment lines and header
            df = pd.read_csv(file_path, delim_whitespace=True, skiprows=[0, 1])
            
            # Standard column names for stdmet data
            # Adjust as needed for other data types
            column_map = {
                "#YY": "year",
                "MM": "month",
                "DD": "day",
                "hh": "hour",
                "mm": "minute",
                "WDIR": "wind_direction",
                "WSPD": "wind_speed",
                "GST": "gust_speed",
                "WVHT": "wave_height",
                "DPD": "dominant_wave_period",
                "APD": "average_wave_period",
                "MWD": "mean_wave_direction",
                "PRES": "pressure",
                "ATMP": "air_temperature",
                "WTMP": "water_temperature",
                "DEWP": "dewpoint_temperature",
                "VIS": "visibility",
                "PTDY": "pressure_tendency",
                "TIDE": "tide_level",
            }
            
            # Rename columns if they exist
            df.rename(columns={k: v for k, v in column_map.items() if k in df.columns}, inplace=True)
            
            # Convert date columns to datetime
            if all(c in df.columns for c in ["year", "month", "day", "hour", "minute"]):
                df["timestamp"] = pd.to_datetime(
                    df[["year", "month", "day", "hour", "minute"]],
                    errors="coerce"
                )
            
            # Extract buoy ID from filename
            buoy_id = file_path.stem.split("_")[0]
            df["buoy_id"] = buoy_id
            
            # Add metadata
            df["source"] = "NOAA NDBC"
            df["file_path"] = str(file_path)
            
            return df
            
        except Exception as e:
            logger.error(f"Error parsing buoy data: {e}")
            raise
    
    def download_multiple_buoys(
        self,
        buoy_ids: List[str],
        year: Optional[int] = None,
        month: Optional[int] = None,
        data_type: str = "stdmet",
    ) -> Dict[str, Path]:
        """Download data for multiple buoys in parallel.
        
        Args:
            buoy_ids: List of buoy identifiers
            year: Year to download
            month: Month to download
            data_type: Type of data to download
            
        Returns:
            Dictionary mapping buoy IDs to downloaded file paths
        """
        results = {}
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_buoy = {
                executor.submit(self.download_buoy_data, buoy_id, year, month, data_type): buoy_id
                for buoy_id in buoy_ids
            }
            
            for future in concurrent.futures.as_completed(future_to_buoy):
                buoy_id = future_to_buoy[future]
                try:
                    results[buoy_id] = future.result()
                except Exception as e:
                    logger.error(f"Error downloading data for buoy {buoy_id}: {e}")
        
        return results
    
 