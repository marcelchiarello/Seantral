'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TimeSeriesData } from '../lib/api';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TimeSeriesChartProps {
  data?: TimeSeriesData;
  title?: string;
  height?: number;
  isLoading?: boolean;
}

export default function TimeSeriesChart({ 
  data, 
  title = 'Time Series Data',
  height = 300,
  isLoading = false
}: TimeSeriesChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ height: `${height}px` }} 
        className="flex items-center justify-center bg-gray-100 rounded-md"
      >
        <p className="text-gray-500">Loading chart component...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        style={{ height: `${height}px` }} 
        className="flex items-center justify-center bg-gray-100 rounded-md"
      >
        <p className="text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div 
        style={{ height: `${height}px` }} 
        className="flex items-center justify-center bg-gray-100 rounded-md"
      >
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Process data for Plotly
  const timestamps = data.data.map(point => new Date(point.timestamp));
  const values = data.data.map(point => point.value);

  // Determine appropriate y-axis range based on parameter type
  const getYAxisRange = () => {
    const isTemperature = data.unit === '°C';
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    if (isTemperature) {
      // For temperature, create a reasonable window around the data (+/- 3 degrees)
      return [Math.floor(min) - 3, Math.ceil(max) + 3];
    } else {
      // For wave height or other metrics, start from 0 and add some headroom
      return [0, Math.ceil(max * 1.2)];
    }
  };

  // Customize format based on parameter type
  const getValueFormat = () => {
    return data.unit === '°C' ? '.1f' : '.2f';
  };

  const plotData = [
    {
      x: timestamps,
      y: values,
      type: 'scatter',
      mode: 'lines+markers',
      line: { 
        color: '#1a70ff',
        width: 2
      },
      marker: { 
        color: '#1a70ff',
        size: 6
      },
      hovertemplate: `%{y:.2f} ${data.unit}<br>%{x|%d %b %H:%M}<extra></extra>`,
      name: data.label
    }
  ];

  const layout = {
    title: {
      text: title,
      font: {
        family: 'Arial, sans-serif',
        size: 16
      }
    },
    height: height,
    margin: { l: 50, r: 20, t: 50, b: 50 },
    xaxis: {
      title: 'Time',
      tickformat: '%d %b %H:%M',
      gridcolor: '#f0f0f0'
    },
    yaxis: {
      title: {
        text: data.unit,
        font: {
          family: 'Arial, sans-serif',
          size: 14
        }
      },
      tickformat: getValueFormat(),
      range: getYAxisRange(),
      gridcolor: '#f0f0f0'
    },
    font: {
      family: 'Arial, sans-serif'
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    autosize: true,
    hovermode: 'closest'
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false
  };

  return (
    <div className="w-full">
      {/* @ts-ignore - Plotly typing issues */}
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: `${height}px` }}
      />
      <div className="text-xs text-gray-500 text-right mt-1">
        Source: {data.source}
      </div>
    </div>
  );
} 