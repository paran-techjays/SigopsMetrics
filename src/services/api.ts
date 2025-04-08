// API service for fetching data

// Types
export interface MetricData {
  value: number | string
  unit?: string
  change?: number
  changeLabel?: string
}

export interface LocationMetric {
  location: string
  value: number
}

export interface TimeSeriesData {
  date: string
  value: number
  location: string
}

export interface MapPoint {
  lat: number
  lon: number
  value: number
  name: string
}

// Mock data functions
export const fetchMetricData = async (
  metric: string,
  region: string,
  dateRange: string,
  dateAggregation: string,
): Promise<MetricData> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Return mock data based on metric
  switch (metric) {
    case "throughput":
      return {
        value: 1223,
        unit: "vph",
        change: 7.1,
        changeLabel: "Change from prior period",
      }
    case "arrivalsOnGreen":
      return {
        value: 69.8,
        unit: "%",
        change: 0,
        changeLabel: "Change from prior period",
      }
    case "progressionRatio":
      return {
        value: 1.07,
        change: -0.02,
        changeLabel: "Change from prior period",
      }
    case "spillbackRatio":
      return {
        value: 17.5,
        unit: "%",
        change: 2.3,
        changeLabel: "Change from prior period",
      }
    case "peakPeriodSplitFailures":
      return {
        value: 8.3,
        unit: "%",
        change: -0.5,
        changeLabel: "Change from prior period",
      }
    case "offPeakSplitFailures":
      return {
        value: 4.7,
        unit: "%",
        change: -0.2,
        changeLabel: "Change from prior period",
      }
    case "travelTimeIndex":
      return {
        value: 1.31,
        change: 0.03,
        changeLabel: "Change from prior period",
      }
    case "planningTimeIndex":
      return {
        value: 1.42,
        change: 0.01,
        changeLabel: "Change from prior period",
      }
    case "dailyTrafficVolumes":
      return {
        value: 16863,
        unit: "vpd",
        change: 3.2,
        changeLabel: "Change from prior period",
      }
    default:
      return {
        value: 0,
        change: 0,
        changeLabel: "Change from prior period",
      }
  }
}

export const fetchLocationMetrics = async (metric: string, region: string): Promise<LocationMetric[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate mock data for locations
  const locations = [
    "Clairmont Rd",
    "Peachtree Blvd",
    "Ponce de Leon Ave",
    "North Druid Hills Rd",
    "Chamblee Tucker Rd",
    "Buford Hwy",
    "North Ave",
    "Piedmont Ave - Midtown",
    "Dunwoody - Sandy Springs",
    "SR 154 - Memorial Dr",
    "Lawson Drive",
    "Perimeter Mall - Ashford",
    "Dekalb - Inman Park",
    "Campbellton Rd",
    "Candler Rd",
    "Ivan Allen Jr Blvd",
    "Howell Mill Rd",
    "Northside Dr",
    "Mitchell St",
    "MLK Jr Blvd",
    "Luckie St",
    "Baker St",
    "Atlanta Ave",
    "City of Atlanta - Midtown",
    "Decatur - Downtown",
    "Lee St - College Park",
    "Dekalb - Hapeville",
    "Greenbriar Pkwy",
    "14th St",
  ]

  // Return mock data with random values based on the metric
  return locations
    .map((location) => {
      let value: number

      switch (metric) {
        case "throughput":
          value = Math.floor(Math.random() * 1500) + 500
          break
        case "arrivalsOnGreen":
          value = Math.random() * 0.4 + 0.5 // 50% to 90%
          break
        default:
          value = Math.random() * 100
      }

      return { location, value }
    })
    .sort((a, b) => b.value - a.value) // Sort by value descending
}

export const fetchTimeSeriesData = async (
  metric: string,
  region: string,
  dateRange: string,
  dateAggregation: string,
): Promise<TimeSeriesData[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate dates based on aggregation
  const dates: string[] = []
  const now = new Date()
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  if (dateAggregation === "monthly") {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      dates.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`)
    }
  } else if (dateAggregation === "weekly") {
    for (let i = 51; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      dates.push(`${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`)
    }
  } else {
    // Daily
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dates.push(`${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`)
    }
  }

  // Generate locations
  const locations = [
    "Clairmont Rd",
    "Peachtree Blvd",
    "Ponce de Leon Ave",
    "North Druid Hills Rd",
    "Chamblee Tucker Rd",
    "Buford Hwy",
    "North Ave",
    "Piedmont Ave",
    "Dunwoody",
    "Memorial Dr",
    "Lawson Drive",
    "Perimeter Mall",
    "Inman Park",
    "Campbellton Rd",
    "Candler Rd",
  ]

  // Generate time series data for each location
  const result: TimeSeriesData[] = []

  locations.forEach((location) => {
    let baseValue: number
    let variance: number

    switch (metric) {
      case "throughput":
        baseValue = Math.floor(Math.random() * 1500) + 500
        variance = 300
        break
      case "arrivalsOnGreen":
        baseValue = Math.random() * 0.4 + 0.5 // 50% to 90%
        variance = 0.1
        break
      default:
        baseValue = Math.random() * 100
        variance = 20
    }

    dates.forEach((date) => {
      const value = baseValue + (Math.random() * variance * 2 - variance)
      result.push({
        date,
        value,
        location,
      })
    })
  })

  return result
}

export const fetchMapData = async (metric: string, region: string): Promise<MapPoint[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Generate mock map data centered around Atlanta
  const centerLat = 33.749
  const centerLon = -84.388
  const points: MapPoint[] = []

  // Generate a grid of points
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      // Create a grid with some randomness
      const lat = centerLat + (i - 10) * 0.01 + Math.random() * 0.005
      const lon = centerLon + (j - 10) * 0.01 + Math.random() * 0.005

      // Generate value based on metric
      let value: number
      switch (metric) {
        case "throughput":
          value = Math.floor(Math.random() * 8000) + 1000
          break
        case "arrivalsOnGreen":
          value = Math.floor(Math.random() * 100)
          break
        default:
          value = Math.floor(Math.random() * 100)
      }

      // Only add some points to avoid overcrowding
      if (Math.random() > 0.7) {
        points.push({
          lat,
          lon,
          value,
          name: `Intersection ${i}-${j}`,
        })
      }
    }
  }

  return points
}

