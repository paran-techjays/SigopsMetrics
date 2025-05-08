import { apiClient } from './apiClient';

// Set base URL from environment variable or use a default
const BASE_URL = 'https://sigopsmetrics-api.dot.ga.gov';

/**
 * Filter API service for fetching filter options data
 */
const filterApi = {
  /**
   * Get all available zone groups (regions)
   */
  getZoneGroups: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/zonegroups`);
  },

  /**
   * Get all available zones (districts)
   */
  getZones: async () => {
    try {
      const result = await apiClient.get<string[]>(`${BASE_URL}/signals/zones`);
      console.log('Zones API response:', result);
      return result;
    } catch (error) {
      console.error('Error fetching zones:', error);
      throw error;
    }
  },

  /**
   * Get zones filtered by zone group
   */
  getZonesByZoneGroup: async (zoneGroup: string) => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/zonesbyzonegroup/${zoneGroup}`);
  },

  /**
   * Get all available agencies
   */
  getAgencies: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/agencies`);
  },

  /**
   * Get all available counties
   */
  getCounties: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/counties`);
  },

  /**
   * Get all available cities
   */
  getCities: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/cities`);
  },

  /**
   * Get all available corridors
   */
  getCorridors: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/corridors`);
  },

  /**
   * Get corridors filtered by other filter options
   */
  getCorridorsByFilter: async (
    filter: { 
      zoneGroup?: string; 
      zone?: string; 
      agency?: string; 
      county?: string; 
      city?: string;
    }
  ) => {
    const { zoneGroup, zone, agency, county, city } = filter;
    const url = `${BASE_URL}/signals/corridorsbyfilter?zoneGroup=${zoneGroup || ''}&zone=${zone || ''}&agency=${agency || ''}&county=${county || ''}&city=${city || ''}`;
    return await apiClient.get<string[]>(url);
  },

  /**
   * Get all available subcorridors
   */
  getSubcorridors: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/subcorridors`);
  },

  /**
   * Get subcorridors filtered by corridor
   */
  getSubcorridorsByCorridor: async (corridor: string) => {
    const url = `${BASE_URL}/signals/subcorridorsbycorridor/${encodeURIComponent(corridor)}`;
    return await apiClient.get<string[]>(url);
  },

  /**
   * Get all available priorities
   */
  getPriorities: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/priorities`);
  },

  /**
   * Get all available classifications
   */
  getClassifications: async () => {
    return await apiClient.get<string[]>(`${BASE_URL}/signals/classifications`);
  }
};

export default filterApi; 