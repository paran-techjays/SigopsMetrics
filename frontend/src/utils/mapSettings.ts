import colors from './colors';
import Metrics from './metrics';

// Define interface for map config settings
export interface MapConfig {
  field: string;
  label: string;
  formatType: string;
  formatDecimals: number;
  ranges: number[][];
  legendLabels: string[];
  legendColors: string[];
}

// Global map settings
export const mapGlobalSettings = {
  mapSource: 'main',
  mapInterval: 'mo',
  mapLevel: 'sig',
};

// Map settings configuration for different metrics
export const mapSettings: Record<string, MapConfig> = {
  // Daily Traffic Volume
  dailyTrafficVolume: {
    field: "vpd",
    label: "Daily Traffic Volume",
    formatType: "number",
    formatDecimals: 0,
    ranges: [
      [0, 10000],
      [10001, 20000],
      [20001, 30000],
      [30001, 40000],
      [40001, 10000000]
    ],
    legendLabels: [
      "0 - 10,000 vpd",
      "10,001 - 20,000 vpd",
      "20,001 - 30,000 vpd", 
      "30,001 - 40,000 vpd", 
      "40,001+ vpd"
    ],
    legendColors: [colors.lightTeal, colors.teal, colors.blue, colors.darkBlue, colors.purple],
  },

  // Throughput
  throughput: {
    field: "tp",
    label: "Throughput",
    formatType: "number",
    formatDecimals: 0,
    ranges: [
      [0, 2000],
      [2001, 4000],
      [4001, 6000],
      [6001, 8000],
      [8001, 100000]
    ],
    legendLabels: [
      "0 - 2,000 vph",
      "2,001 - 4,000 vph",
      "4,001 - 6,000 vph",
      "6,001 - 8,000 vph",
      "8,001+ vph"
    ],
    legendColors: [colors.lightTeal, colors.teal, colors.blue, colors.darkBlue, colors.purple],
  },

  // Arrivals on Green
  arrivalsOnGreen: {
    field: "aogd",
    label: "Arrivals on Green",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [0, 0.2],
      [0.21, 0.4],
      [0.41, 0.6],
      [0.61, 0.8],
      [0.81, 1]
    ],
    legendLabels: [
      "0% - 20%",
      "21% - 40%",
      "41% - 60%",
      "61% - 80%",
      "81% - 100%"
    ],
    legendColors: [colors.purple, colors.redOrange, colors.yellow, colors.greenYellow, colors.green],
  },

  // Progression Rate
  progressionRate: {
    field: "prd",
    label: "Progression Ratio",
    formatType: "number",
    formatDecimals: 2,
    ranges: [
      [0, 0.4],
      [0.41, 0.8],
      [0.81, 1],
      [1.01, 1.2],
      [1.21, 10]
    ],
    legendLabels: [
      "0 - 0.4",
      "0.41 - 0.8",
      "0.81 - 1",
      "1.01 - 1.2",
      "1.2+"
    ],
    legendColors: [colors.red, colors.redOrange, colors.orange, colors.yellow, colors.yellowGreen],
  },

  // Queue Spillback
  spillbackRate: {
    field: "qsd",
    label: "Queue Spillback",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [0, 0.2],
      [0.21, 0.4],
      [0.41, 0.6],
      [0.61, 0.8],
      [0.81, 1]
    ],
    legendLabels: [
      "0% - 20%",
      "20.01% - 40%",
      "40.01% - 60%",
      "60.01% - 80%",
      "80.01% - 100%"
    ],
    legendColors: [colors.green, colors.greenYellow, colors.yellow, colors.redOrange, colors.red],
  },

  // Peak Period Split Failures
  peakPeriodSplitFailures: {
    field: "sfd",
    label: "Peak Split Failures",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [0, 0.05],
      [0.051, 0.1],
      [0.101, 0.15],
      [0.151, 0.2],
      [0.201, 1]
    ],
    legendLabels: [
      "0% - 5%",
      "5.1% - 10%",
      "10.1% - 15%",
      "15.1% - 20%",
      "20.1%+"
    ],
    legendColors: [colors.green, colors.greenYellow, colors.yellow, colors.redOrange, colors.red],
  },

  // Off-Peak Split Failures
  offPeakSplitFailures: {
    field: "sfo",
    label: "Off-Peak Split Failures",
    formatType: "percent",
    formatDecimals: 1,
    ranges: [
      [0, 0.05],
      [0.051, 0.1],
      [0.101, 0.15],
      [0.151, 0.2],
      [0.201, 1]
    ],
    legendLabels: [
      "0% - 5%",
      "5.1% - 10%",
      "10.1% - 15%",
      "15.1% - 20%",
      "20.1%+"
    ],
    legendColors: [colors.green, colors.greenYellow, colors.yellow, colors.redOrange, colors.red],
  },
};

// Map metric codes to display names
export const displayMetricToMeasureMap: Record<string, string> = {
  dailyTrafficVolume: "vpd",
  throughput: "tp",
  arrivalsOnGreen: "aogd",
  progressionRate: "prd",
  spillbackRate: "qsd",
  peakPeriodSplitFailures: "sfd",
  offPeakSplitFailures: "sfo",
};

export default mapSettings; 
