// API service for fetching data
import { apiClient } from './api/apiClient';
import AppConfig from '../utils/appConfig';

// Types
export interface MetricData {
  value: number | string
  unit?: string
  change?: number
  changeLabel?: string
}

export interface LocationMetric {
  location: string
  value: number
}

export interface TimeSeriesData {
  date: string
  value: number
  location: string
}

export interface MapPoint {
  lat: number
  lon: number
  value: number
  name: string
  signalID?: string
  mainStreet?: string
  sideStreet?: string
}

// API base URL
const API_BASE_URL = AppConfig.settings.API_PATH;

console.log('API_BASE_URL1', API_BASE_URL);

// Map metric IDs to their API keys
export const metricApiKeys: { [key: string]: string } = {
  // Operations metrics
  dailyTrafficVolumes: 'vpd',
  throughput: 'tp',
  arrivalsOnGreen: 'aogd',
  progressionRatio: 'prd',
  spillbackRatio: 'qsd',
  peakPeriodSplitFailures: 'sfd',
  offPeakSplitFailures: 'sfo',
  travelTimeIndex: 'tti',
  planningTimeIndex: 'pti',
  
  // Maintenance metrics
  detectorUptime: 'du',
  pedestrianPushbuttonActivity: 'papd',
  pedestrianPushbuttonUptime: 'pau',
  cctvUptime: 'cctv',
  communicationUptime: 'cu'
};

const metricValueKeys: Record<string, string> = {
  dailyTrafficVolumes: "vpd",
  throughput: "vph",
  arrivalsOnGreen: "aog",
  progressionRatio: "pr", 
  spillbackRatio: "qs_freq",
  peakPeriodSplitFailures: "sf_freq",
  offPeakSplitFailures: "sf_freq",
  travelTimeIndex: "tti",
  planningTimeIndex: "pti"
};

// Default payload for API requests
const getDefaultPayload = (region: string) => ({
  dateRange: 4,
  timePeriod: 4,
  customStart: null,
  customEnd: null,
  daysOfWeek: null,
  startTime: null,
  endTime: null,
  zone_Group: region,
  zone: null,
  agency: null,
  county: null,
  city: null,
  corridor: null,
  signalId: "",
  priority: "",
  classification: ""
});

// Fetch straight average metric data
export const fetchMetricData = async (
  metric: string,
  region: string,
  dateRange: string,
  dateAggregation: string,
): Promise<MetricData> => {
  try {
    const apiKey = metricApiKeys[metric];
    
    if (!apiKey) {
      throw new Error(`Invalid metric: ${metric}`);
    }
    
    const data = await apiClient.post<any>(
      `/metrics/straightaverage?source=main&measure=${apiKey}`,
      getDefaultPayload(region)
    );
    
    return {
      value: data.avg || 0,
      unit: getMetricUnit(metric),
      change: data.delta * 100 || 0, // Convert to percentage
      changeLabel: "Change from prior period",
    };
  } catch (error) {
    console.error('Error fetching metric data:', error);
    return {
      value: 0,
      change: 0,
      changeLabel: "Change from prior period",
    };
  }
};

// Get unit for a metric
const getMetricUnit = (metric: string): string | undefined => {
  switch(metric) {
    case 'throughput':
      return 'vph';
    case 'dailyTrafficVolumes':
      return 'vpd';
    case 'arrivalsOnGreen':
    case 'progressionRatio':
    case 'spillbackRatio':
    case 'peakPeriodSplitFailures':
    case 'offPeakSplitFailures':
      return '%';
    default:
      return undefined;
  }
};

// Fetch location metrics
export const fetchLocationMetrics = async (metric: string, region: string): Promise<LocationMetric[]> => {
  try {
    const apiKey = metricApiKeys[metric];
    
    if (!apiKey) {
      throw new Error(`Invalid metric: ${metric}`);
    }
    
    const data = await apiClient.post<any[]>(
      `/metrics/average?source=main&measure=${apiKey}&dashboard=false`,
      getDefaultPayload(region)
    );
    
    return data.map((item: any) => ({
      location: item.label,
      value: item.avg || 0
    })).sort((a: LocationMetric, b: LocationMetric) => a.value - b.value);
  } catch (error) {
    console.error('Error fetching location metrics:', error);
    return [];
  }
};

// Fetch time series data
export const fetchTimeSeriesData = async (
  metric: string,
  region: string,
  dateRange: string,
  dateAggregation: string,
): Promise<TimeSeriesData[]> => {
  try {
    const apiKey = metricApiKeys[metric];
    
    if (!apiKey) {
      throw new Error(`Invalid metric: ${metric}`);
    }
    
    const data = await apiClient.post<any[]>(
      `/metrics/filter?source=main&measure=${apiKey}`,
      getDefaultPayload(region)
    );
    
    // Map API response to TimeSeriesData
    return data.map((item: any) => {
      const metricValue = item[metricValueKeys[metric]] || 0;
      return {
        date: formatDate(item.month),
        value: parseFloat(metricValue),
        location: item.corridor
      };
    });
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return [];
  }
};

// Format date string
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } catch (e) {
    return dateString;
  }
};

// Fetch map data
export const fetchMapData = async (metric: string, region: string): Promise<MapPoint[]> => {
  try {
    const apiKey = metricApiKeys[metric];
    
    if (!apiKey) {
      throw new Error(`Invalid metric: ${metric}`);
    }
    
    // Fetch all signals
    const signals = await apiClient.get<any[]>(`/signals/all`);
    
    // Fetch signal metrics
    const metrics = await apiClient.post<any[]>(
      `/metrics/signals/filter/average?source=main&measure=${apiKey}`,
      getDefaultPayload(region)
    );
    
    // Create a map of signal IDs to metric values
    const metricMap = new Map();
    metrics.forEach((item: any) => {
      metricMap.set(item.label, item.avg);
    });
    
    // Map signals to map points
    return signals
      .filter((signal: any) => signal.latitude && signal.longitude)
      .map((signal: any) => {
        const value = metricMap.get(signal.signalID) || 0;
        
        return {
          lat: signal.latitude,
          lon: signal.longitude,
          value,
          name: signal.mainStreetName ? (signal.sideStreetName ? 
            `${signal.mainStreetName} @ ${signal.sideStreetName}` : 
            signal.mainStreetName) : 
            `Signal ${signal.signalID}`,
          signalID: signal.signalID,
          mainStreet: signal.mainStreetName,
          sideStreet: signal.sideStreetName
        };
      });
  } catch (error) {
    console.error('Error fetching map data:', error);
    return [];
  }
};

