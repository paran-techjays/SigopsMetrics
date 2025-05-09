// Interface for the application configuration
export interface IAppConfig {
  default: any[];
  production: boolean;
  API_PATH: string;
  mapCenterLat: number;
  mapCenterLon: number;
  hasPageOperations: boolean;
  hasPageMaintenance: boolean;
  hasPageWatchdog: boolean;
  hasPageTeamsTasks: boolean;
  hasPageReports: boolean;
  hasPageHealthMetrics: boolean;
  hasPageSummaryTrend: boolean;
  hasBtnContactUs: boolean;
  hasBtnGdotApplications: boolean;
  ttiGoal: number;
  ptiGoal: number;
  duGoal: number;
  ppuGoal: number;
  cctvGoal: number;
  cuGoal: number;
  [key: string]: any; // Allow for additional properties
}

// Default configuration - this will be used until the actual config is loaded
const defaultConfig: IAppConfig = {
  default: [],
  production: false,
  API_PATH: "https://sigopsmetrics-api.dot.ga.gov", // Default to test API
  mapCenterLat: 33.757776,
  mapCenterLon: -84.391578,
  hasPageOperations: true,
  hasPageMaintenance: true,
  hasPageWatchdog: true,
  hasPageTeamsTasks: true,
  hasPageReports: false,
  hasPageHealthMetrics: true,
  hasPageSummaryTrend: true,
  hasBtnContactUs: true,
  hasBtnGdotApplications: true,
  ttiGoal: 1.2,
  ptiGoal: 1.3,
  duGoal: 0.95,
  ppuGoal: 0.95,
  cctvGoal: 0.95,
  cuGoal: 0.95
};

// AppConfig class to load and manage configuration
class AppConfig {
  private static _settings: IAppConfig = defaultConfig;
  private static _isLoaded: boolean = false;

  // Getter for configuration settings
  static get settings(): IAppConfig {
    return AppConfig._settings;
  }

  // Determine the current environment
  private static getEnvironment(): string {
    // In production builds, NODE_ENV will be 'production'
    if (import.meta.env?.MODE === 'production') {
      return 'prod';
    } else if (import.meta.env?.MODE === 'test') {
      return 'test';
    } else {
      return 'dev';
    }
  }

  // Load the configuration file based on environment
  static async load(): Promise<void> {
    const env = this.getEnvironment();
    try {
      const response = await fetch(`/src/config/config.${env}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }
      AppConfig._settings = await response.json() as IAppConfig;
      AppConfig._isLoaded = true;
      console.log(`AppConfig loaded for environment: ${env}`);
    } catch (error) {
      console.error('Error loading configuration:', error);
      // Continue using default config
      console.warn('Using default configuration');
    }
  }

  // Check if config has been fully loaded
  static get isLoaded(): boolean {
    return AppConfig._isLoaded;
  }

  // Force synchronous loading using a preset config based on environment
  static loadSync(): void {
    if (AppConfig._isLoaded) return;
    
    const env = this.getEnvironment();
    console.log(`Using preset configuration for ${env} environment`);
    
    // Ensure default API path reflects the right environment
    if (env === 'prod') {
      AppConfig._settings.API_PATH = "https://sigopsmetrics-api.dot.ga.gov/";
      AppConfig._settings.production = true;
    } else {
      AppConfig._settings.API_PATH = "https://sigopsmetrics-api.dot.ga.gov/";
      AppConfig._settings.production = env === 'test';
    }
    
    // Attempt to load async in background to get full config
    this.load().catch(err => {
      console.warn('Failed to load full config in background:', err);
    });
  }

  // Initialize configuration as soon as possible
  static initialize(): Promise<void> {
    // If we need immediate access, use loadSync first
    this.loadSync();
    return this.load();
  }
}

// Auto-initialize when imported
AppConfig.loadSync();

// Also start loading the full config
AppConfig.load().catch(err => {
  console.warn('Background config loading failed:', err);
});

export default AppConfig;
