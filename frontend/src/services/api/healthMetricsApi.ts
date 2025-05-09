import { HEALTH_METRICS_ENDPOINTS } from '../../constants/apiEndpoints';
import { apiClient } from './apiClient';

// Signal interface to match the one in metricsSlice.ts
export interface Signal {
    id: number;
    signalID?: string;
    intersection: string;
    latitude: number;
    longitude: number;
    region: string;
    status: string;
    mainStreetName?: string;
    sideStreetName?: string;
}

export interface MaintenanceMetric {
    zone_Group: string;
    corridor: string;
    month: string;
    'percent Health': number;
    'missing Data': number | null;
    'detection Uptime Score': number | null;
    'ped Actuation Uptime Score': number | null;
    'comm Uptime Score': number | null;
    'cctv Uptime Score': number | null;
    'flash Events Score': number | null;
    'detection Uptime': number | null;
    'ped Actuation Uptime': number | null;
    'comm Uptime': number | null;
    'cctv Uptime': number | null;
    'flash Events': number | null;
    description: string | null;
    id: number;
}

export interface OperationsMetric {
    zone_Group: string;
    corridor: string;
    month: string;
    'percent Health': number;
    'missing Data': number | null;
    'platoon Ratio Score': number | null;
    'ped Delay Score': number | null;
    'split Failures Score': number | null;
    'travel Time Index Score': number | null;
    'buffer Index Score': number | null;
    'platoon Ratio': number | null;
    'ped Delay': number | null;
    'split Failures': number | null;
    'travel Time Index': number | null;
    'buffer Index': number | null;
    description: string | null;
    id: number;
}

export interface SafetyMetric {
    zone_Group: string;
    corridor: string;
    month: string;
    'percent Health': number;
    'missing Data': number | null;
    'crash Rate Index Score': number | null;
    'kabco Crash Severity Index Score': number | null;
    'high Speed Index Score': number | null;
    'ped Injury Exposure Index Score': number | null;
    'crash Rate Index': number | null;
    'kabco Crash Severity Index': number | null;
    'high Speed Index': number | null;
    'ped Injury Exposure Index': number | null;
    description: string | null;
    id: number;
}

export interface RegionAverage {
    operations: number;
    maintenance: number;
    safety: number;
}

export interface FetchMetricsParams {
    source?: string;
    level?: string;
    interval?: string;
    measure: string;
    start: string;
    end: string;
}

export interface FetchRegionParams {
    zoneGroup: string;
    month: string;
}

export const fetchMetrics = async (params: FetchMetricsParams): Promise<MaintenanceMetric[] | OperationsMetric[] | SafetyMetric[]> => {
    try {
        const response = await apiClient.get<MaintenanceMetric[] | OperationsMetric[] | SafetyMetric[]>(
            HEALTH_METRICS_ENDPOINTS.METRICS,
            {
                params: {
                    source: params.source || 'main',
                    level: params.level || 'cor',
                    interval: params.interval || 'mo',
                    measure: params.measure,
                    start: params.start,
                    end: params.end
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error fetching metrics:', error);
        throw error;
    }
};

export const fetchRegionAverage = async (params: FetchRegionParams): Promise<RegionAverage> => {
    try {
        const response = await apiClient.get<number[]>(
            HEALTH_METRICS_ENDPOINTS.MONTH_AVERAGES,
            {
                params: {
                    zoneGroup: params.zoneGroup,
                    month: params.month
                }
            }
        );
        
        // API returns array of [operations, maintenance, safety]
        const [operationsValue, maintenanceValue, safetyValue] = response;
        
        return {
            operations: operationsValue === -1 ? 0 : operationsValue * 100,
            maintenance: maintenanceValue === -1 ? 0 : maintenanceValue * 100,
            safety: safetyValue === -1 ? 0 : safetyValue * 100
        };
    } catch (error) {
        console.error('Error fetching region average:', error);
        throw error;
    }
};

export const healthMetricsApi = {
    fetchMetrics,
    fetchRegionAverage,
};

export default healthMetricsApi;