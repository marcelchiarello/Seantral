'use client';

import React from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type MarineMapProps = {
  width?: string;
  height?: string;
};

export default function MarineMap({ width = '100%', height = '500px' }: MarineMapProps) {
  return (
    <div style={{ width, height, position: 'relative' }}>
      <Map
        mapLib={import('maplibre-gl')}
        initialViewState={{
          longitude: -70.9,
          latitude: 42.35,
          zoom: 6
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={{
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
        }}
      >
        <NavigationControl position="top-right" />
      </Map>
    </div>
  );
} 