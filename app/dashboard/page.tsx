'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import api, { Alert, TimeSeriesData } from '../lib/api';
import AlertsList from '../components/AlertsList';

// Import the interactive map component dynamically to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('../components/InteractiveMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded-md">
      <p className="text-gray-500">Caricamento mappa...</p>
    </div>
  )
});

// Import the time series chart component dynamically
const TimeSeriesChart = dynamic(() => import('../components/TimeSeriesChart'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] flex items-center justify-center bg-gray-100 rounded-md">
      <p className="text-gray-500">Caricamento grafico...</p>
    </div>
  )
});

export default function Dashboard() {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoadingTimeSeries, setIsLoadingTimeSeries] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState<string>('temperature');
  const [selectedLocation, setSelectedLocation] = useState<string>('otranto');
  const [customLocation, setCustomLocation] = useState<{lat: number, lng: number} | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean>(false);

  // Fetch data on component mount
  useEffect(() => {
    checkApiStatus();
    fetchData();
  }, []);

  // Check if the API is available
  const checkApiStatus = async () => {
    try {
      // Verifica sia l'endpoint principale che un endpoint dei dati
      const rootResponse = await fetch('http://localhost:8000/', { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // timeout di 3 secondi
      });
      
      // Verifica anche l'endpoint dei dati per essere sicuri
      const dataResponse = await fetch('http://localhost:8000/v1/timeseries?parameter=temperature&location=otranto', {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      setApiAvailable(rootResponse.ok && dataResponse.ok);
    } catch (error) {
      console.log('API non disponibile, verranno utilizzati dati simulati:', error);
      setApiAvailable(false);
    }
  };

  // Fetch data when parameter or location changes
  useEffect(() => {
    fetchTimeSeriesData();
  }, [selectedParameter, selectedLocation, customLocation]);

  // Fetch alerts when location changes
  useEffect(() => {
    fetchAlerts();
  }, [selectedLocation, customLocation]);

  // Fetch all data
  const fetchData = async () => {
    fetchTimeSeriesData();
    fetchAlerts();
  };

  // Fetch time series data
  const fetchTimeSeriesData = async () => {
    setIsLoadingTimeSeries(true);
    try {
      let data;
      if (customLocation) {
        // Use custom location coordinates for the API call
        data = await api.getTimeSeries(
          selectedParameter, 
          selectedLocation, 
          undefined, 
          customLocation.lat, 
          customLocation.lng
        );
      } else {
        // Use predefined location
        data = await api.getTimeSeries(selectedParameter, selectedLocation);
      }
      
      // Aggiorna lo stato dell'API in base ai dati ricevuti
      setApiAvailable(!data.isSimulated);
      setTimeSeriesData(data);
    } catch (error) {
      console.error('Error fetching time series data:', error);
      setApiAvailable(false);
    } finally {
      setIsLoadingTimeSeries(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      let data;
      if (customLocation) {
        // Custom location might not have predefined alerts
        data = await api.getAlerts(null, customLocation.lat, customLocation.lng);
      } else {
        data = await api.getAlerts(selectedLocation);
      }
      
      // Aggiorna lo stato dell'API se riceviamo dati non simulati
      if (data.length > 0 && data[0].isSimulated === false) {
        setApiAvailable(true);
      }
      
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setApiAvailable(false);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Handle parameter change
  const handleParameterChange = (parameter: string) => {
    setSelectedParameter(parameter);
  };

  // Handle location selection from map
  const handleLocationSelect = (locationId: string | null, lat: number, lng: number) => {
    console.log(`Selected location: ${locationId || 'custom'} at ${lat},${lng}`);
    
    if (locationId) {
      setSelectedLocation(locationId);
      setCustomLocation(null);
    } else {
      // Custom location clicked on map
      setCustomLocation({ lat, lng });
    }
  };

  // Format the location name for display
  const getLocationName = () => {
    if (customLocation) {
      return `Punto personalizzato (${customLocation.lat.toFixed(4)}, ${customLocation.lng.toFixed(4)})`;
    } else {
      return selectedLocation.charAt(0).toUpperCase() + selectedLocation.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold">Seantral</a>
          <nav>
            <ul className="flex gap-6">
              <li><a href="/" className="hover:text-blue-200 transition-colors">Home</a></li>
              <li><a href="/auth/login" className="hover:text-blue-200 transition-colors">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Dashboard dei Dati Marini</h1>
          <div className="flex flex-col gap-2">
            <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-800 font-medium">
              Selezionato: {getLocationName()}
            </div>
            {!apiAvailable && (
              <div className="bg-yellow-50 px-4 py-2 rounded-lg text-yellow-800 text-sm">
                ⚠️ API non disponibile - Dati simulati in uso
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-lg shadow-md bg-white overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Mappa Interattiva</h3>
                <p className="text-sm text-gray-500">Clicca in qualsiasi punto della mappa per selezionarlo</p>
              </div>
              <div className="p-4">
                <InteractiveMap onLocationSelect={handleLocationSelect} />
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-lg shadow-md bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Origine Dati</h3>
              </div>
              <div className="p-4">
                <ul className="divide-y">
                  <li className="py-2 flex justify-between">
                    <span>Copernicus Marine</span>
                    <span className={apiAvailable ? "text-green-500" : "text-yellow-500"}>
                      {apiAvailable ? "Attivo" : "Simulato"}
                    </span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>NOAA NDBC</span>
                    <span className={apiAvailable ? "text-green-500" : "text-yellow-500"}>
                      {apiAvailable ? "Attivo" : "Simulato"}
                    </span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>Sensori Proprietari</span>
                    <span className="text-yellow-500">In arrivo</span>
                  </li>
                  <li className="py-2 flex justify-between items-center">
                    <span>Stato dell'API</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${apiAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {apiAvailable ? "ONLINE" : "OFFLINE"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="rounded-lg shadow-md bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Allarmi Recenti</h3>
                <p className="text-sm text-gray-500">Per {getLocationName()}</p>
              </div>
              <div className="p-4">
                <AlertsList alerts={alerts} isLoading={isLoadingAlerts} />
              </div>
              {!apiAvailable && alerts.length > 0 && (
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  Nota: Questi allarmi sono generati automaticamente per scopi dimostrativi.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="rounded-lg shadow-md bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Dati Temporali</h3>
                <p className="text-sm text-gray-500">Per {getLocationName()}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleParameterChange('temperature')}
                  className={`px-3 py-1 rounded text-sm ${selectedParameter === 'temperature' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Temperatura
                </button>
                <button 
                  onClick={() => handleParameterChange('wave_height')}
                  className={`px-3 py-1 rounded text-sm ${selectedParameter === 'wave_height' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Altezza Onde
                </button>
              </div>
            </div>
            <div className="p-4">
              <TimeSeriesChart 
                data={timeSeriesData || undefined} 
                isLoading={isLoadingTimeSeries}
                title={selectedParameter === 'temperature' 
                  ? `Temperatura Superficiale Marina - ${getLocationName()}`
                  : `Altezza Significativa delle Onde - ${getLocationName()}`}
              />
            </div>
            {!apiAvailable && timeSeriesData && (
              <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
                Nota: Questi dati sono simulati in base a modelli statistici e potrebbero non riflettere le condizioni reali.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 