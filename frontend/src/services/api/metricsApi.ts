import axios from 'axios';
import {
    FilterParams,
    MetricData,
    MetricsFilterRequest,
    MetricsTrendRequest,
    MonthAverage,
    Signal,
    TrendData,
} from '../../types/api.types';

const API_BASE_URL = 'https://sigopsmetrics-api.dot.ga.gov';

export const metricsApi = {
    // Signals
    getAllSignals: () => {
        return axios.get<Signal[]>(`${API_BASE_URL}/signals/all`).then(response => response.data);
    },

    // Month Averages
    getMonthAverages: (zoneGroup: string, month: string) => {
        return axios.get<MonthAverage[]>(`${API_BASE_URL}/metrics/monthaverages?zoneGroup=${encodeURIComponent(zoneGroup)}&month=${month}`)
            .then(response => response.data);
    },

    // Metrics Filter - POST request to /metrics/filter
    getMetricsFilter: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure } = params;
        return axios.post<MetricData[]>(
            `${API_BASE_URL}/metrics/filter?source=${source}&measure=${measure}`,
            filterParams
        ).then(response => response.data);
    },

    // Metrics Average - POST request to /metrics/average
    getMetricsAverage: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure, dashboard = false } = params;
        return axios.post<number>(
            `${API_BASE_URL}/metrics/average?source=${source}&measure=${measure}&dashboard=${dashboard}`,
            filterParams
        ).then(response => response.data);
    },

    // Straight Average - POST request to /metrics/straightaverage
    getStraightAverage: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure } = params;
        return axios.post<number>(
            `${API_BASE_URL}/metrics/straightaverage?source=${source}&measure=${measure}`,
            filterParams
        ).then(response => response.data);
    },

    // Signals Filter Average
    getSignalsFilterAverage: (params: MetricsFilterRequest, filterParams: FilterParams) => {
        const { source, measure } = params;
        return axios.post<number>(
            `${API_BASE_URL}/metrics/signals/filter/average?source=${source}&measure=${measure}`,
            filterParams
        ).then(response => response.data);
    },

    // Trend Data
    getTrendData: (params: MetricsTrendRequest) => {
        const { source, level, interval, measure, start, end } = params;
        return axios.get<TrendData>(
            `${API_BASE_URL}/metrics?source=${source}&level=${level}&interval=${interval}&measure=${measure}&start=${start}&end=${end}`
        ).then(response => response.data);
    },

    // Summary Trends
    getSummaryTrends: (filterParams: FilterParams) => {
        return axios.post<any>(`${API_BASE_URL}/metrics/summarytrends?source=main`, filterParams)
            .then(response => response.data);
    },
}; 