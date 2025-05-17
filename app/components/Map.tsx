'use client';

import React, { useState } from 'react';

// Predefined monitoring stations with coordinates
const MONITORING_STATIONS = [
  { id: 'otranto', name: 'Otranto', lat: 40.1467, lng: 18.4912 },
  { id: 'bari', name: 'Bari', lat: 41.1171, lng: 16.8719 },
  { id: 'venice', name: 'Venice Lagoon', lat: 45.4408, lng: 12.3155 },
  { id: 'naples', name: 'Gulf of Naples', lat: 40.8518, lng: 14.2681 },
  { id: 'messina', name: 'Strait of Messina', lat: 38.1938, lng: 15.5540 }
];

interface MapProps {
  onLocationSelect?: (locationId: string, lat: number, lng: number) => void;
}

export default function Map({ onLocationSelect }: MapProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>('otranto');

  // Handle station selection
  const handleStationClick = (stationId: string) => {
    setSelectedLocation(stationId);
    const station = MONITORING_STATIONS.find(s => s.id === stationId);
    if (station && onLocationSelect) {
      onLocationSelect(station.id, station.lat, station.lng);
    }
  };

  // Calculate the bounding box for Otranto and surrounding area
  const otrantoBbox = '10.0,36.0,20.0,46.0'; // Larger area covering Italian coasts
  
  // Get marker parameters for OpenStreetMap
  const getMarkerParams = () => {
    const markers = MONITORING_STATIONS.map(station => {
      return `&marker=${station.lat}%2C${station.lng}%2C${station.id === selectedLocation ? 'red' : 'blue'}`;
    }).join('');
    return markers;
  };
  
  return (
    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000, 
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Monitoring Stations</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {MONITORING_STATIONS.map(station => (
            <button
              key={station.id}
              onClick={() => handleStationClick(station.id)}
              style={{
                backgroundColor: selectedLocation === station.id ? '#1a70ff' : '#f0f0f0',
                color: selectedLocation === station.id ? 'white' : 'black',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {station.name}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        right: '10px', 
        zIndex: 1000, 
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Stazione selezionata:</div>
        <div>{MONITORING_STATIONS.find(s => s.id === selectedLocation)?.name || 'Otranto'}</div>
        <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
          Clicca su una stazione per visualizzare i dati
        </div>
      </div>
      
      <iframe 
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${otrantoBbox}&amp;layer=mapnik${getMarkerParams()}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
        title="OpenStreetMap"
        allowFullScreen
      ></iframe>
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        right: '10px',
        background: 'rgba(255,255,255,0.8)',
        padding: '4px',
        borderRadius: '2px',
        fontSize: '10px'
      }}>
        © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
      </div>
    </div>
  );
} 