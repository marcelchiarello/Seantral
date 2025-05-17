import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://localhost:8000';

// Types
export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface TimeSeriesData {
  label: string;
  data: TimeSeriesPoint[];
  unit: string;
  source: string;
  location?: string;
  isSimulated?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  source: string;
  location?: string;
  isSimulated?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Constants for generating realistic data
const LOCATION_BASE_TEMPS = {
  otranto: 19.2,    // Slightly warmer in summer
  bari: 18.8,
  venice: 17.5,     // Cooler in north
  naples: 20.1,     // Warmer in Tyrrhenian Sea
  messina: 19.5
};

const LOCATION_WAVE_HEIGHTS = {
  otranto: 0.8,     // Moderate waves in Adriatic
  bari: 0.6,
  venice: 0.4,      // Calmer in lagoon area
  naples: 0.5,      // Sheltered bay
  messina: 1.2      // Stronger currents in strait
};

// Location-specific generators for fallback data
const getLocationBasedValue = (locationId: string, parameter: string, lat?: number, lng?: number): number => {
  // If custom coordinates are provided, generate data based on them
  if (lat !== undefined && lng !== undefined) {
    if (parameter === 'temperature') {
      // Temperature tends to be warmer in the south and cooler in the north
      const baseTemp = 20.0 - (lat - 38.0) * 0.5; // Decrease by 0.5°C per degree of latitude
      return baseTemp + (Math.random() * 0.6 - 0.3); // Small random noise
    } else if (parameter === 'wave_height') {
      // Waves tend to be higher in open sea (further from coast)
      // Simple approximation of distance from Italian coast
      const isOpenSea = lng < 12.0 || lng > 18.0 || lat < 37.0 || lat > 45.0;
      const baseHeight = isOpenSea ? 1.2 : 0.6;
      return baseHeight + (Math.random() * 0.4 - 0.2);
    } else {
      return 10.0; // Default fallback
    }
  }

  // Else use predefined location data
  const normalizedLocation = locationId.toLowerCase();
  
  if (parameter === 'temperature') {
    // Base temperature with daily fluctuation (time of day effect)
    const baseTemp = LOCATION_BASE_TEMPS[normalizedLocation as keyof typeof LOCATION_BASE_TEMPS] || 18.5;
    const hourOfDay = new Date().getHours();
    const timeEffect = Math.sin((hourOfDay - 6) * Math.PI / 12) * 1.2; // +/- 1.2°C daily variation
    return baseTemp + timeEffect + (Math.random() * 0.6 - 0.3); // Small random noise
  } else if (parameter === 'wave_height') {
    // Base wave height with some randomness
    const baseHeight = LOCATION_WAVE_HEIGHTS[normalizedLocation as keyof typeof LOCATION_WAVE_HEIGHTS] || 0.7;
    return baseHeight + (Math.random() * 0.4 - 0.2); // +/- 0.2m variation
  } else {
    return 10.0; // Default fallback
  }
};

// Generate time series with realistic patterns
const generateTimeSeriesData = (parameter: string, locationId: string, hours: number = 24, lat?: number, lng?: number): TimeSeriesPoint[] => {
  const now = new Date();
  const data: TimeSeriesPoint[] = [];
  
  // Create a realistic pattern with some trend and cycles
  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now.getTime() - (hours - 1 - i) * 3600 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      value: getLocationBasedValue(locationId, parameter, lat, lng)
    });
  }
  
  return data;
};

// API client
const api = {
  /**
   * Fetch time series data from the API
   * @param parameter - The parameter to fetch (temperature, wave_height, etc.)
   * @param location - Location identifier
   * @param days - Number of days of data to fetch
   * @param lat - Optional latitude for custom location
   * @param lng - Optional longitude for custom location
   */
  async getTimeSeries(
    parameter: string = 'temperature', 
    location: string = 'otranto', 
    days: number = 7,
    lat?: number,
    lng?: number
  ): Promise<TimeSeriesData> {
    let isSimulated = false;
    
    try {
      // Imposta un timeout per la chiamata API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await axios.get(`${API_BASE_URL}/v1/timeseries`, {
        params: { 
          parameter, 
          location,
          days,
          ...(lat !== undefined && lng !== undefined ? { lat, lng } : {})
        },
        signal: controller.signal
      }).catch(error => {
        isSimulated = true;
        throw error; // Rilancia l'errore per essere gestito dal blocco catch
      });
      
      clearTimeout(timeoutId);
      
      // Verifica se i dati sono validi
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        isSimulated = true;
        throw new Error('Invalid data format received from API');
      }
      
      // Add flag to indicate these are real data
      return {
        ...response.data,
        isSimulated: false
      };
    } catch (error) {
      console.error('Error fetching time series data:', error);
      isSimulated = true;
      
      // Return location-based fallback data if API is unavailable
      const hours = days * 24 > 72 ? 72 : days * 24; // Limit to 72 hours max for performance
      
      let label: string;
      if (lat !== undefined && lng !== undefined) {
        label = `${parameter === 'temperature' ? 'Temperatura' : 'Altezza Onde'} a ${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      } else {
        const locationName = location.charAt(0).toUpperCase() + location.slice(1);
        const parameterName = parameter.replace('_', ' ');
        const parameterLabel = parameterName.charAt(0).toUpperCase() + parameterName.slice(1);
        label = `${parameterLabel} at ${locationName}`;
      }
      
      return {
        label,
        data: generateTimeSeriesData(parameter, location, hours, lat, lng),
        unit: parameter === 'temperature' ? '°C' : 'm',
        source: 'Dati simulati (API non disponibile)',
        location: location,
        isSimulated: true,
        coordinates: lat !== undefined && lng !== undefined ? { lat, lng } : undefined
      };
    }
  },

  /**
   * Fetch alerts from the API
   * @param location - Optional location to filter alerts
   * @param lat - Optional latitude for custom location
   * @param lng - Optional longitude for custom location
   */
  async getAlerts(location?: string | null, lat?: number, lng?: number): Promise<Alert[]> {
    let isSimulated = false;
    
    try {
      // Imposta un timeout per la chiamata API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      let params: any = {};
      if (location) {
        params.location = location;
      }
      if (lat !== undefined && lng !== undefined) {
        params.lat = lat;
        params.lng = lng;
      }
      
      const response = await axios.get(`${API_BASE_URL}/v1/alerts`, { 
        params,
        signal: controller.signal 
      }).catch(error => {
        isSimulated = true;
        throw error; // Rilancia l'errore per essere gestito dal blocco catch
      });
      
      clearTimeout(timeoutId);
      
      // Verifica se i dati sono validi
      if (!response.data || !Array.isArray(response.data)) {
        isSimulated = true;
        throw new Error('Invalid data format received from API');
      }
      
      // Add flag to indicate these are real data
      return response.data.map((alert: Alert) => ({
        ...alert,
        isSimulated: false
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      isSimulated = true;
      
      // For custom locations, generate ad hoc alerts based on location
      if (lat !== undefined && lng !== undefined) {
        const isOpenSea = lng < 12.0 || lng > 18.0 || lat < 37.0 || lat > 45.0;
        const isInNorth = lat > 43.0;
        const isInAdriatic = lng > 14.0;
        
        const customAlerts: Alert[] = [];
        
        // Add relevant alerts based on location factors
        if (isOpenSea) {
          customAlerts.push({
            id: `custom-1-${lat.toFixed(2)}-${lng.toFixed(2)}`,
            title: 'High Wave Alert',
            description: `Open sea conditions at ${lat.toFixed(2)}°, ${lng.toFixed(2)}° - Exercise caution`,
            severity: 'warning' as const,
            timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            source: 'Sistema di Allerta Simulato',
            isSimulated: true,
            coordinates: { lat, lng }
          });
        }
        
        if (isInNorth && Math.random() > 0.5) {
          customAlerts.push({
            id: `custom-2-${lat.toFixed(2)}-${lng.toFixed(2)}`,
            title: 'Low Visibility Warning',
            description: 'Northern Adriatic fog conditions possible in the next 24 hours',
            severity: 'info' as const,
            timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
            source: 'Sistema di Allerta Simulato',
            isSimulated: true,
            coordinates: { lat, lng }
          });
        }
        
        if (isInAdriatic && Math.random() > 0.7) {
          customAlerts.push({
            id: `custom-3-${lat.toFixed(2)}-${lng.toFixed(2)}`,
            title: 'Current Advisory',
            description: 'Moderate northbound currents in the Adriatic',
            severity: 'info' as const,
            timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            source: 'Sistema di Allerta Simulato',
            isSimulated: true,
            coordinates: { lat, lng }
          });
        }
        
        // If no specific alerts were generated, add a generic one
        if (customAlerts.length === 0 && Math.random() > 0.5) {
          customAlerts.push({
            id: `custom-generic-${lat.toFixed(2)}-${lng.toFixed(2)}`,
            title: 'Marine Conditions Report',
            description: `Regular monitoring active at ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
            severity: 'info' as const,
            timestamp: new Date().toISOString(),
            source: 'Sistema di Allerta Simulato',
            isSimulated: true,
            coordinates: { lat, lng }
          });
        }
        
        return customAlerts;
      }
      
      // Return fallback alerts if API is unavailable for predefined locations
      const allAlerts: Alert[] = [
        {
          id: 'fallback-1',
          title: 'High Wave Height Alert',
          description: 'Buoy near Otranto: Wave height exceeds 2.5m',
          severity: 'critical' as const,
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          source: 'Sistema di Allerta Simulato',
          location: 'otranto',
          isSimulated: true
        },
        {
          id: 'fallback-2',
          title: 'SST Anomaly',
          description: 'Venice Lagoon: +1.8°C above average',
          severity: 'warning' as const,
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          source: 'Sistema di Allerta Simulato',
          location: 'venice',
          isSimulated: true
        },
        {
          id: 'fallback-3',
          title: 'Strong Current',
          description: 'Strait of Messina: Unusually strong current detected',
          severity: 'info' as const,
          timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          source: 'Sistema di Allerta Simulato',
          location: 'messina',
          isSimulated: true
        },
        {
          id: 'fallback-4',
          title: 'Small Craft Advisory',
          description: 'Gulf of Naples: Wind speeds increasing to 20 knots',
          severity: 'warning' as const,
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          source: 'Sistema di Allerta Simulato',
          location: 'naples',
          isSimulated: true
        },
        {
          id: 'fallback-5',
          title: 'Water Quality Alert',
          description: 'Bari Harbor: Elevated turbidity levels detected',
          severity: 'info' as const,
          timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
          source: 'Sistema di Allerta Simulato',
          location: 'bari',
          isSimulated: true
        }
      ];
      
      // Filter by location if provided
      return location 
        ? allAlerts.filter(alert => alert.location === location)
        : allAlerts;
    }
  }
};

export default api; 