"""Parquet storage utilities for persisting data frames."""

import os
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from datetime import datetime

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from loguru import logger

def save_to_parquet(
    df: pd.DataFrame,
    output_path: Union[str, Path],
    partition_cols: Optional[List[str]] = None,
    compression: str = "snappy",
    metadata: Optional[Dict[str, str]] = None,
) -> Path:
    """Save DataFrame to Parquet format.
    
    Args:
        df: DataFrame to save
        output_path: Path to save file
        partition_cols: Columns to partition by
        compression: Compression algorithm (snappy, gzip, brotli, none)
        metadata: Additional metadata to include
        
    Returns:
        Path to saved file
    """
    output_path = Path(output_path)
    
    # Ensure directory exists
    if partition_cols is None:
        output_path.parent.mkdir(parents=True, exist_ok=True)
    else:
        output_path.mkdir(parents=True, exist_ok=True)
    
    # Add standard metadata
    if metadata is None:
        metadata = {}
    
    # Add standard metadata
    full_metadata = {
        "created_at": datetime.now().isoformat(),
        "rows": str(len(df)),
        "columns": ",".join(df.columns),
        **metadata
    }
    
    try:
        logger.info(f"Saving DataFrame to {output_path} with {compression} compression")
        
        table = pa.Table.from_pandas(df)
        
        # Add metadata to the table
        metadata_dict = {k.encode(): v.encode() for k, v in full_metadata.items()}
        table = table.replace_schema_metadata({**table.schema.metadata, **metadata_dict})
        
        if partition_cols:
            logger.info(f"Partitioning by {partition_cols}")
            pq.write_to_dataset(
                table,
                root_path=str(output_path),
                partition_cols=partition_cols,
                compression=compression,
            )
        else:
            pq.write_table(
                table,
                output_path,
                compression=compression,
            )
            
        logger.success(f"Successfully saved DataFrame to {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Error saving DataFrame to parquet: {e}")
        raise

def read_from_parquet(
    input_path: Union[str, Path],
    columns: Optional[List[str]] = None,
    filters: Optional[List] = None,
) -> pd.DataFrame:
    """Read DataFrame from Parquet file.
    
    Args:
        input_path: Path to parquet file or directory
        columns: Columns to read
        filters: PyArrow filters to apply
        
    Returns:
        DataFrame with data
    """
    input_path = Path(input_path)
    
    try:
        logger.info(f"Reading parquet from {input_path}")
        
        if input_path.is_dir():
            # Read partitioned dataset
            table = pq.read_table(
                input_path,
                columns=columns,
                filters=filters,
            )
        else:
            # Read single file
            table = pq.read_table(
                input_path,
                columns=columns,
                filters=filters,
            )
            
        df = table.to_pandas()
        
        # Extract metadata
        metadata = {k.decode(): v.decode() for k, v in table.schema.metadata.items() 
                  if k != b'pandas' and isinstance(k, bytes) and isinstance(v, bytes)}
        
        logger.info(f"Read {len(df)} rows from {input_path}")
        logger.debug(f"Metadata: {metadata}")
        
        return df
        
    except Exception as e:
        logger.error(f"Error reading parquet from {input_path}: {e}")
        raise 