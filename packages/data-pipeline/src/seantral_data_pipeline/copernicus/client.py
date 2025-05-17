"""Client for interacting with the Copernicus Marine Environment Monitoring Service API."""

import os
import tempfile
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timedelta

import pandas as pd
import numpy as np
from loguru import logger

class CopernicusClient:
    """Client for downloading data from Copernicus Marine Service."""
    
    def __init__(
        self,
        username: str,
        password: str,
        output_dir: Optional[Path] = None,
    ):
        """Initialize Copernicus client.
        
        Args:
            username: Copernicus username
            password: Copernicus password
            output_dir: Directory for downloaded files
        """
        self.username = username
        self.password = password
        self.output_dir = output_dir or Path(tempfile.gettempdir()) / "copernicus"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Check if motuclient is available
        try:
            subprocess.run(["motuclient", "--version"], capture_output=True, check=True)
            logger.info("Found motuclient")
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.error("motuclient not found. Please install it with: pip install motuclient")
            raise RuntimeError("motuclient not found")
    
    def download_data(
        self,
        dataset_id: str,
        product_id: str,
        variables: List[str],
        start_date: datetime,
        end_date: datetime,
        min_lon: float,
        max_lon: float,
        min_lat: float,
        max_lat: float,
        output_filename: Optional[str] = None,
    ) -> Path:
        """Download Copernicus data using motuclient.
        
        Args:
            dataset_id: Copernicus dataset ID
            product_id: Copernicus product ID
            variables: List of variables to download
            start_date: Start date
            end_date: End date
            min_lon: Minimum longitude
            max_lon: Maximum longitude
            min_lat: Minimum latitude
            max_lat: Maximum latitude
            output_filename: Custom output filename
            
        Returns:
            Path to downloaded file
        """
        if output_filename is None:
            output_filename = f"{product_id}_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.nc"
        
        output_file = self.output_dir / output_filename
        
        # Build motuclient command
        cmd = [
            "motuclient",
            "--quiet",
            "--user", self.username,
            "--pwd", self.password,
            "--motu", f"https://my.cmems-du.eu/motu-web/Motu",
            "--service-id", dataset_id,
            "--product-id", product_id,
            "--longitude-min", str(min_lon),
            "--longitude-max", str(max_lon),
            "--latitude-min", str(min_lat),
            "--latitude-max", str(max_lat),
            "--date-min", start_date.strftime("%Y-%m-%d %H:%M:%S"),
            "--date-max", end_date.strftime("%Y-%m-%d %H:%M:%S"),
            "--out-dir", str(self.output_dir),
            "--out-name", output_filename,
        ]
        
        # Add variables
        for var in variables:
            cmd.extend(["--variable", var])
        
        # Execute command
        logger.info(f"Downloading data from Copernicus: {output_filename}")
        logger.debug(f"Command: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"Error downloading data: {result.stderr}")
            raise RuntimeError(f"Failed to download data: {result.stderr}")
        
        logger.success(f"Successfully downloaded data to {output_file}")
        return output_file
    
    # TODO: Implement methods to process NetCDF files into parquet format
    
    def download_sst_data(
        self,
        start_date: datetime,
        end_date: datetime,
        region: Optional[Dict[str, float]] = None,
    ) -> Path:
        """Convenience method to download sea surface temperature data.
        
        Args:
            start_date: Start date
            end_date: End date
            region: Region to download data for (dict with min_lon, max_lon, min_lat, max_lat)
                   If None, global data is downloaded
                   
        Returns:
            Path to downloaded file
        """
        region = region or {
            "min_lon": -180.0,
            "max_lon": 180.0,
            "min_lat": -90.0,
            "max_lat": 90.0,
        }
        
        # Example for Global Ocean OSTIA SST Analysis
        return self.download_data(
            dataset_id="SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001",
            product_id="METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2",
            variables=["analysed_sst", "analysis_error"],
            start_date=start_date,
            end_date=end_date,
            min_lon=region["min_lon"],
            max_lon=region["max_lon"],
            min_lat=region["min_lat"],
            max_lat=region["max_lat"],
            output_filename=f"sst_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.nc",
        )

# TODO: Implement NetCDF to Parquet conversion utilities 