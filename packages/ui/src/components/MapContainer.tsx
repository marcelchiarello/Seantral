import React, { useEffect, useRef } from 'react';

export interface MapContainerProps {
  width?: string;
  height?: string;
  className?: string;
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  width = '100%',
  height = '400px',
  className = '',
  center = [0, 0],
  zoom = 1,
  children,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Implement MapLibre GL JS initialization here
    // This is just a placeholder
    if (!mapContainerRef.current) return;
    
    // Mock implementation - to be replaced with actual MapLibre integration
    console.log('Map initialized with:', {
      container: mapContainerRef.current,
      center,
      zoom
    });

    return () => {
      // Cleanup function
      console.log('Map destroyed');
    };
  }, [center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      className={`relative ${className}`}
      style={{ width, height }}
    >
      {children}
    </div>
  );
};

// TODO: Implement actual MapLibre GL JS integration 