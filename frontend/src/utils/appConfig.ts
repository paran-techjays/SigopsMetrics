interface IAppConfig {
    API_PATH: string
    ttiGoal: number
    ptiGoal: number
    duGoal: number
    ppuGoal: number
    cctvGoal: number
    cuGoal: number
  }
  
  // Default configuration values
  const defaultConfig: IAppConfig = {
    API_PATH: "/api/",
    ttiGoal: 1.20,
    ptiGoal: 1.30,
    duGoal: 0.95,
    ppuGoal: 0.95,
    cctvGoal: 0.95,
    cuGoal: 0.95,
  }
  
  export const AppConfig = {
    settings: defaultConfig,
  }
  