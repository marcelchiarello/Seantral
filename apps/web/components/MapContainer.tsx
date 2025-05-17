'use client';

import { useEffect, useRef } from 'react';

export interface MapContainerProps {
  width?: string;
  height?: string;
}

export default function MapContainer({
  width = '100%',
  height = '400px',
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Import MapLibre dynamically to avoid SSR issues
    const initializeMap = async () => {
      if (!mapContainer.current) return;
      
      try {
        const maplibregl = (await import('maplibre-gl')).default;
        await import('maplibre-gl/dist/maplibre-gl.css');
        
        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: {
            version: 8,
            sources: {
              'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap Contributors',
              },
            },
            layers: [
              {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm-tiles',
                minzoom: 0,
                maxzoom: 19,
              },
            ],
          },
          center: [-70.9, 42.35], // Default to Massachusetts Bay
          zoom: 6,
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        return () => {
          map.remove();
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        // Display error message in the map container
        if (mapContainer.current) {
          mapContainer.current.innerHTML = '<div style="color: red; padding: 20px;">Error loading map library. Check console for details.</div>';
        }
      }
    };

    initializeMap();
  }, []);

  return (
    <div style={{ width, height, position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute' }} />
    </div>
  );
} 