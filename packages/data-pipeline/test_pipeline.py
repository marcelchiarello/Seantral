"""Test script for the data pipeline modules."""

import os
import tempfile
from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Import data pipeline modules
try:
    from seantral_data_pipeline.storage.parquet import save_to_parquet, read_from_parquet
except ImportError:
    print("Failed to import from seantral_data_pipeline. Make sure it's installed or in your PYTHONPATH.")
    print("You can install it in development mode with: pip install -e .")
    exit(1)

def test_parquet_storage():
    """Test parquet storage functions."""
    print("Testing parquet storage...")
    
    # Create a temporary directory for test files
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Create a sample DataFrame
        dates = pd.date_range(start='2025-01-01', periods=10)
        df = pd.DataFrame({
            'date': dates,
            'temperature': np.random.uniform(15, 25, 10),
            'pressure': np.random.uniform(1010, 1020, 10),
            'location': ['Gulf of Maine'] * 10,
            'source': ['test_data'] * 10
        })
        
        # Test saving to parquet
        output_path = temp_path / 'test_data.parquet'
        metadata = {
            'source': 'test_script',
            'version': '1.0.0',
            'description': 'Test data for parquet storage'
        }
        
        result_path = save_to_parquet(
            df=df,
            output_path=output_path,
            metadata=metadata
        )
        
        print(f"Saved DataFrame to {result_path}")
        
        # Check if file exists
        assert output_path.exists(), f"Output file {output_path} doesn't exist"
        
        # Test reading from parquet
        read_df = read_from_parquet(input_path=output_path)
        
        # Check shape
        assert df.shape == read_df.shape, f"Shapes don't match: {df.shape} vs {read_df.shape}"
        
        # Check columns
        assert set(df.columns) == set(read_df.columns), f"Columns don't match"
        
        print("Parquet storage test passed!")

def main():
    """Run tests for data pipeline modules."""
    print("Running data pipeline tests...")
    test_parquet_storage()
    print("All tests passed!")

if __name__ == "__main__":
    main() 