export interface MetricsOptions {
  measure: string;
  field?: string;
  label: string;
  formatType?: string;
  formatDecimals?: number;
  source?: string;
  interval?: string;
  level?: string;
  isMapMetrics?: boolean;
  start?: string;
  end?: string;
}

export class Metrics {
  measure: string;
  field: string;
  label: string;
  formatType: string;
  formatDecimals: number;
  source: string;
  interval: string;
  level: string;
  isMapMetrics: boolean;
  start?: string;
  end?: string;

  constructor(options: MetricsOptions) {
    this.measure = options.measure;
    this.field = options.field || '';
    this.label = options.label;
    this.formatType = options.formatType || 'number';
    this.formatDecimals = options.formatDecimals !== undefined ? options.formatDecimals : 0;
    this.source = options.source || 'main';
    this.interval = options.interval || 'mo';
    this.level = options.level || 'sig';
    this.isMapMetrics = options.isMapMetrics || false;
    this.start = options.start;
    this.end = options.end;
  }
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
}

export interface MetricsTrendRequest {
  metricName: string;
  startDate: string;
  endDate: string;
}

export interface MetricsTrendResponse {
  data: TrendDataPoint[];
} 

export default Metrics; 