'use client';

import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Predefined monitoring stations with coordinates
const MONITORING_STATIONS = [
  { id: 'otranto', name: 'Otranto', lat: 40.1467, lng: 18.4912 },
  { id: 'bari', name: 'Bari', lat: 41.1171, lng: 16.8719 },
  { id: 'venice', name: 'Venice Lagoon', lat: 45.4408, lng: 12.3155 },
  { id: 'naples', name: 'Gulf of Naples', lat: 40.8518, lng: 14.2681 },
  { id: 'messina', name: 'Strait of Messina', lat: 38.1938, lng: 15.5540 }
];

interface InteractiveMapProps {
  onLocationSelect?: (locationId: string | null, lat: number, lng: number) => void;
}

export default function InteractiveMap({ onLocationSelect }: InteractiveMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>('otranto');
  const [customMarker, setCustomMarker] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const customMarkerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Leaflet icons workaround
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Initialize map if it doesn't exist
    if (!mapRef.current && mapContainerRef.current) {
      // Center on Italy
      mapRef.current = L.map(mapContainerRef.current).setView([42.0, 14.0], 6);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Add predefined station markers
      MONITORING_STATIONS.forEach(station => {
        const marker = L.marker([station.lat, station.lng], {
          title: station.name,
          icon: createIcon(station.id === selectedLocation ? 'red' : 'blue')
        }).addTo(mapRef.current!);
        
        marker.on('click', () => {
          handleStationClick(station.id);
        });
        
        // Add popup with station name
        marker.bindPopup(`<b>${station.name}</b><br>Stazione di monitoraggio`);
        
        markersRef.current.push(marker);
      });

      // Enable clicking anywhere on the map
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
        customMarkerRef.current = null;
      }
    };
  }, []);

  // Create custom colored icon
  const createIcon = (color: string) => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Handle clicking on a station
  const handleStationClick = (stationId: string) => {
    setSelectedLocation(stationId);
    setCustomMarker(null);
    
    // Update marker colors
    markersRef.current.forEach((marker, index) => {
      const station = MONITORING_STATIONS[index];
      marker.setIcon(createIcon(station.id === stationId ? 'red' : 'blue'));
    });
    
    // Remove custom marker if exists
    if (customMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(customMarkerRef.current);
      customMarkerRef.current = null;
    }

    // Call the callback with station coordinates
    const station = MONITORING_STATIONS.find(s => s.id === stationId);
    if (station && onLocationSelect) {
      onLocationSelect(station.id, station.lat, station.lng);
    }
  };

  // Handle clicking on any point on the map
  const handleMapClick = (lat: number, lng: number) => {
    // Skip if clicked on or very close to an existing station
    const isNearStation = MONITORING_STATIONS.some(station => {
      const distance = Math.sqrt(
        Math.pow(station.lat - lat, 2) + Math.pow(station.lng - lng, 2)
      );
      return distance < 0.1; // Approximately 11km
    });

    if (isNearStation) return;

    // Update state
    setSelectedLocation(null);
    setCustomMarker({ lat, lng });
    
    // Reset station marker colors
    markersRef.current.forEach((marker, index) => {
      marker.setIcon(createIcon('blue'));
    });
    
    // Add or move custom marker
    if (mapRef.current) {
      if (customMarkerRef.current) {
        mapRef.current.removeLayer(customMarkerRef.current);
      }
      
      customMarkerRef.current = L.marker([lat, lng], {
        icon: createIcon('green')
      }).addTo(mapRef.current);
      
      customMarkerRef.current.bindPopup(`<b>Punto personalizzato</b><br>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`).openPopup();
    }
    
    // Call callback with custom coordinates
    if (onLocationSelect) {
      onLocationSelect(null, lat, lng);
    }
  };

  return (
    <div className="relative w-full h-[500px]">
      <div ref={mapContainerRef} className="w-full h-full rounded-md"></div>

      <div className="absolute top-3 right-3 z-10 bg-white p-3 rounded-md shadow-md text-sm">
        <div className="font-bold mb-1">Punto selezionato:</div>
        {selectedLocation ? (
          <div>{MONITORING_STATIONS.find(s => s.id === selectedLocation)?.name}</div>
        ) : customMarker ? (
          <div>Punto personalizzato<br />Lat: {customMarker.lat.toFixed(4)}, Lng: {customMarker.lng.toFixed(4)}</div>
        ) : (
          <div>Nessun punto selezionato</div>
        )}
        <div className="mt-2 text-xs italic">
          Clicca in qualsiasi punto della mappa per selezionarlo
        </div>
      </div>
    </div>
  );
} 