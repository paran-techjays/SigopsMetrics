import { apiClient } from './apiClient';
import { WatchdogParams } from '../../types/api.types';

export interface WatchdogTableData {
    zoneGroup: string;
    zone: string;
    corridor: string;
    signalID: string;
    name: string;
    alert: string;
    occurrences: number;
    streak: number;
    date: string;
}

export interface WatchdogData {
    id?: string;
    timestamp?: string;
    alert?: string;
    status?: string;
    location?: string;
    x: string[];
    y: string[];
    z: number[][];
    tableData: WatchdogTableData[];
}

export const watchdogApi = {
    getWatchdogData: (params: WatchdogParams) => {
        return apiClient.post<WatchdogData[]>('/watchdog/data', params);
    },
}; 