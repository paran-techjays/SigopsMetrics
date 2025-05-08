import { MetricsTrendRequest, MetricsTrendResponse } from '../types/metrics';

export const fetchMetricsTrend = async (request: MetricsTrendRequest): Promise<MetricsTrendResponse> => {
    const response = await fetch('/api/metrics/trend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch metrics trend data');
    }

    return response.json();
}; 