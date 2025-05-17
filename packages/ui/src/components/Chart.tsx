import React from 'react';

export interface ChartData {
  x: number[] | string[];
  y: number[];
  type: 'scatter' | 'bar' | 'line';
  name?: string;
  mode?: 'lines' | 'markers' | 'lines+markers';
}

export interface ChartProps {
  data: ChartData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  xAxisTitle?: string;
  yAxisTitle?: string;
  className?: string;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  xAxisTitle,
  yAxisTitle,
  className = '',
}) => {
  return (
    <div className={`chart-container ${className}`} style={{ width, height }}>
      {/* This is a placeholder for the actual Plotly component */}
      <div className="flex items-center justify-center h-full border border-gray-200 rounded-md bg-gray-50">
        <div className="text-center p-4">
          <h3 className="text-lg font-medium mb-2">{title || 'Chart'}</h3>
          <p className="text-sm text-gray-500">
            Placeholder for Plotly chart with {data.length} data series
          </p>
          <p className="text-xs text-gray-400 mt-2">
            X: {xAxisTitle || 'Time'} | Y: {yAxisTitle || 'Value'}
          </p>
        </div>
      </div>
    </div>
  );
};

// TODO: Implement actual Plotly.js integration 