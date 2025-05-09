import type React from "react"
import Plot from "react-plotly.js"
import { Box, Typography } from "@mui/material"
import { PlotData, Layout } from "plotly.js"
import AppConfig from "../../utils/appConfig"

interface LineGraphProps {
  data?: any[]
  title?: string
  lineColor?: string
  goalValue?: number
  fillColor?: string
  isFilled?: boolean
  metrics?: any
}

const LineGraph: React.FC<LineGraphProps> = ({ 
  data,
  title = "Throughput",
  lineColor = "#66cc66",
  goalValue,
  fillColor,
  isFilled = false,
  metrics
}) => {
  // Use provided data or fallback to default sample data
  const useProvidedData = data && data.length > 0

  // Data points from July 2024 to April 2025 (fallback data)
  const defaultMonths = [
    "Jul 2024",
    "Aug 2024",
    "Sep 2024",
    "Oct 2024",
    "Nov 2024",
    "Dec 2024",
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
  ]

  // Default full dates for hover text
  const defaultFullDates = [
    "Jul 1, 2024",
    "Aug 1, 2024",
    "Sep 1, 2024",
    "Oct 1, 2024",
    "Nov 1, 2024",
    "Dec 1, 2024",
    "Jan 1, 2025",
    "Feb 1, 2025",
    "Mar 1, 2025",
    "Apr 1, 2025",
  ]

  // Values that create the curve shown in the image (fallback data)
  const defaultValues = [1178, 1210, 1240, 1280, 1250, 1230, 1200, 1250, 1290, 1320]
  
  // Use provided data or defaults
  const months = useProvidedData 
    ? data.map(item => {
        const date = new Date(item.month)
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      })
    : defaultMonths
  
  // Full dates for hover information
  const fullDates = useProvidedData 
    ? data.map(item => {
        const date = new Date(item.month)
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`
      })
    : defaultFullDates
    
  const values = useProvidedData 
    ? data.map(item => item.average || item.vph || item[Object.keys(item).find(key => typeof item[key] === 'number') || ''])
    : defaultValues

  // Min and max values for display
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const averageValue = values.reduce((sum, value) => sum + value, 0) / values.length

  // First and last values for display (might not be min/max)
  const firstValue = values[0]
  const lastValue = values[values.length - 1]

  // Determine goal value from multiple sources with priority:
  // 1. Explicit goalValue prop
  // 2. Goal from metrics object
  // 3. Goal from AppConfig based on title
  const getGoalFromAppConfig = () => {
    const { settings } = AppConfig
    
    if (title.includes("Travel Time Index")) {
      return settings.ttiGoal
    } else if (title.includes("Planning Time Index")) {
      return settings.ptiGoal
    } else if (title.includes("Detector Uptime")) {
      return settings.duGoal
    } else if (title.includes("Ped Pushbutton Uptime")) {
      return settings.ppuGoal
    } else if (title.includes("CCTV Uptime")) {
      return settings.cctvGoal
    } else if (title.includes("Comm Uptime")) {
      return settings.cuGoal
    }
    
    return null
  }
  
  // Determine if we should show goal and get the goal value
  const configGoalValue = getGoalFromAppConfig()
  const actualGoalValue = goalValue || metrics?.goal || configGoalValue
  const hasGoal = actualGoalValue !== undefined && actualGoalValue !== null
  
  // Determine whether to include fill based on title/metric type
  const shouldFill = hasGoal || isFilled
  
  // Format goal value for display (percentages vs regular numbers)
  const formatGoalValue = (val: number) => {
    if (title.includes("Uptime")) {
      // For uptime metrics, convert from decimal to percentage
      return (val * 100).toFixed(1) + "%"
    }
    return val.toLocaleString()
  }
  
  // Determine fill color and direction based on the metric type
  let determinedFillColor = fillColor
  let fillDirection = 'tozeroy'
  
  if (!determinedFillColor) {
    if (title.includes("Uptime") || title.includes("Comm")) {
      // For uptime metrics, fill is red and fills when BELOW goal (bad)
      determinedFillColor = "rgba(255, 200, 200, 0.5)"
      fillDirection = 'tonexty' // Fill between lines
    } else if (title.includes("Time Index")) {
      // For TTI and PTI, fill is green and fills when BELOW the line (good)
      determinedFillColor = "rgba(200, 255, 200, 0.5)"
      // fillDirection = 'tonexty' // Fill to zero
    }
  }

  // Create the traces for the plot
  const traces: Partial<PlotData>[] = []
  
  // Add goal line first (for uptime metrics it appears on top)
  if (hasGoal) {
    // Add goal line
    traces.push({
      x: months,
      y: Array(months.length).fill(actualGoalValue),
      type: "scatter",
      mode: "lines",
      line: {
        color: "#999999",
        width: 1,
        dash: "dash",
      },
      hoverinfo: "text",
      hovertext: Array(months.length).fill(`Goal: ${formatGoalValue(actualGoalValue)}`),
      hoverlabel: {
        bgcolor: "#999",
        font: { color: "#fff" },
        bordercolor: "#333",
      },
      name: "Goal"
    })
  }
  
  // Add the data line
  if (shouldFill && title.includes("Uptime")) {
    // For uptime metrics, add the main line after goal line and fill between them
    traces.push({
      x: months,
      y: values,
      type: "scatter",
      mode: "lines",
      line: {
        color: lineColor,
        width: 2,
      },
      fill: 'tonexty',
      fillcolor: determinedFillColor,
      hoverinfo: "text",
      hovertext: values.map((val, i) => `${fullDates[i]}, ${val.toLocaleString()}`),
      hoverlabel: {
        bgcolor: lineColor,
        font: { color: "#fff" },
        bordercolor: "#333",
      },
    })
  } else if (shouldFill && title.includes("Time Index")) {
    // For Time Index metrics, fill below the line (good when below goal)
    traces.push({
      x: months,
      y: values,
      type: "scatter",
      mode: "lines",
      line: {
        color: lineColor,
        width: 2,
      },
      fill: 'tonexty',
      fillcolor: determinedFillColor,
      hoverinfo: "text",
      hovertext: values.map((val, i) => `${fullDates[i]}, ${val.toLocaleString()}`),
      hoverlabel: {
        bgcolor: lineColor,
        font: { color: "#fff" },
        bordercolor: "#333",
      },
    })
  } else {
    // Regular line without fill
    traces.push({
      x: months,
      y: values,
      type: "scatter",
      mode: "lines",
      line: {
        color: lineColor,
        width: 2,
      },
      hoverinfo: "text",
      hovertext: values.map((val, i) => `${fullDates[i]}, ${val.toLocaleString()}`),
      hoverlabel: {
        bgcolor: lineColor,
        font: { color: "#fff" },
        bordercolor: "#333",
      },
    })
  }

  // Create a horizontal line for the average value
  const averageLine: Partial<PlotData> = {
    x: months,
    y: Array(months.length).fill(averageValue),
    type: "scatter",
    mode: "lines",
    line: {
      color: "#888888", // Gray color for average line
      width: 2,
      dash: "solid", // Solid line
    },
    hoverinfo: "text",
    hovertext: Array(months.length).fill(`${averageValue.toLocaleString()}`),
    hoverlabel: {
      bgcolor: "gray",
      font: { color: "#fff" },
      bordercolor: "#333",
    },
    name: "Average"
  }
  
  traces.push(averageLine)

  // Get only four evenly spaced months for x-axis labels (first, 1/3, 2/3, and last)
  const tickValues = useProvidedData
    ? [0, Math.floor(months.length / 3), Math.floor(months.length * 2 / 3), months.length - 1].map(i => months[i])
    : ["Jul 2024", "Oct 2024", "Jan 2025", "Apr 2025"]

  // Layout configuration
  const layout: Partial<Layout> = {
    height: 120,
    margin: {
      l: 0,
      r: 0,
      t: 10,
      b: 30,
      pad: 0,
    },
    xaxis: {
      showgrid: false,
      zeroline: false,
      tickfont: {
        size: 10,
        color: "#666",
      },
      tickvals: ["Jul 2024", "Oct 2024", "Jan 2025", "Apr 2025"],
      ticktext: ["Jul 2024", "Oct 2024", "Jan 2025", "Apr 2025"],
      fixedrange: true,
    },
    yaxis: {
      showgrid: false,
      zeroline: false,
      showticklabels: false,
      fixedrange: true,
    },
    showlegend: false,
    plot_bgcolor: "rgba(0,0,0,0)",
    paper_bgcolor: "rgba(0,0,0,0)",
    hovermode: "closest" as const,
    annotations: [
      {
        x: months[0],
        y: values[0],
        text: Number(values[0]).toFixed(3),
        showarrow: false,
        font: { size: 10 },
        xanchor: "left",
        yanchor: "bottom",
      },
      {
        x: months[months.length - 1],
        y: values[values.length - 1],
        text: Number(values[values.length - 1]).toFixed(3),
        showarrow: false,
        font: { size: 10 },
        xanchor: "right",
        yanchor: "bottom",
      },
    ],
  }

  // Plot configuration
  const config = {
    responsive: true,
    displayModeBar: false,
  }

  return (
    <Box sx={{ mb: 2, position: "relative", width: "100%", maxWidth: "600px" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Typography 
          variant="subtitle1" 
          color="#000000DE" 
          sx={{ 
            mr: 2,
            mt: 4, // Align vertically with the middle of the chart
            width: "90px", // Fixed width for the title
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ flexGrow: 1, width: "calc(100% - 90px)", position: "relative" }}>
          {/* <Box sx={{ position: "absolute", top: "40px", left: "0", width: "100%", zIndex: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
              {firstValue.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: "bold" }}>
              {lastValue.toLocaleString()}
            </Typography>
          </Box> */}
          
          <Plot data={traces} layout={layout} config={config} style={{ width: "100%" }} />
        </Box>
      </Box>
    </Box>
  )
}

export default LineGraph
