export interface ApiConfig {
  ENV: string;
}

export const AppConfig = {
  DEV: {
    "default": [],
    "production": false,
    "API_PATH": "https://vapp-dev-som-01.msc01.nonprod.dot.ga.gov/api/v1",
    "mapCenterLat": 33.757776,
    "mapCenterLon": -84.391578,
    "hasPageOperations": true,
    "hasPageMaintenance": true,
    "hasPageWatchdog": true,
    "hasPageTeamsTasks": true,
    "hasPageReports": false,
    "hasPageHealthMetrics": true,
    "hasPageSummaryTrend": true,
    "hasBtnContactUs": true,
    "hasBtnGdotApplications": true,
    "ttiGoal": 1.2,
    "ptiGoal": 1.3,
    "duGoal": 0.95,
    "ppuGoal": 0.95,
    "cctvGoal": 0.95,
    "cuGoal": 0.95
  },
  TEST: {
    "default": [],
    "production": true,
    "API_PATH": "https://sigopsmetrics-api.dot.ga.gov",
    "mapCenterLat": 33.757776,
    "mapCenterLon": -84.391578,
    "hasPageOperations": true,
    "hasPageMaintenance": true,
    "hasPageWatchdog": true,
    "hasPageTeamsTasks": true,
    "hasPageReports": false,
    "hasPageHealthMetrics": true,
    "hasPageSummaryTrend": true,
    "hasBtnContactUs": true,
    "hasBtnGdotApplications": true,
    "ttiGoal": 1.2,
    "ptiGoal": 1.3,
    "duGoal": 0.95,
    "ppuGoal": 0.95,
    "cctvGoal": 0.95,
    "cuGoal": 0.95
  },
  PROD: {
    "default": [],
    "production": true,
    "API_PATH": "https://sigopsmetrics-api.dot.ga.gov",
    "mapCenterLat": 33.757776,
    "mapCenterLon": -84.391578,
    "hasPageOperations": true,
    "hasPageMaintenance": true,
    "hasPageWatchdog": true,
    "hasPageTeamsTasks": true,
    "hasPageReports": false,
    "hasPageHealthMetrics": true,
    "hasPageSummaryTrend": true,
    "hasBtnContactUs": true,
    "hasBtnGdotApplications": true,
    "ttiGoal": 1.2,
    "ptiGoal": 1.3,
    "duGoal": 0.95,
    "ppuGoal": 0.95,
    "cctvGoal": 0.95,
    "cuGoal": 0.95
  }
};

const getApiConfig = (): ApiConfig => {
  // Check if running in browser with injected ENV
  console.log("window.ENV", window.RUNTIME_CONFIG , window.RUNTIME_CONFIG?.ENV, window);

  if (typeof window !== 'undefined' && window.RUNTIME_CONFIG) {
    return {
      ENV: window.RUNTIME_CONFIG.ENV,
    };
  }
  
  // Fallback for development/build time
  return {
    ENV: import.meta.env.VITE_ENV || 'DEV',
  };
};

const API_CONFIG: ApiConfig = getApiConfig();

export default AppConfig[API_CONFIG.ENV as keyof typeof AppConfig];
