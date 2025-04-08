import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Plot from "react-plotly.js"

export default function SummaryTrend() {
  // Sample data for charts
  const throughputTrend = {
    x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    y: [1150, 1180, 1220, 1250, 1210, 1190, 1230, 1260, 1240, 1270, 1290, 1235],
    type: "scatter",
    mode: "lines+markers",
    marker: { color: "#1976d2" },
    name: "Throughput (vph)",
  }

  const arrivalsOnGreenTrend = {
    x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    y: [65.2, 66.8, 68.1, 67.7, 68.5, 69.2, 68.9, 70.3, 69.6, 68.9, 70.2, 69.9],
    type: "scatter",
    mode: "lines+markers",
    marker: { color: "#4caf50" },
    name: "Arrivals on Green (%)",
  }

  const splitFailuresTrend = {
    x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    y: [9.2, 8.8, 8.1, 7.7, 8.5, 9.2, 8.9, 7.3, 8.6, 8.9, 8.2, 8.3],
    type: "scatter",
    mode: "lines+markers",
    marker: { color: "#f44336" },
    name: "Peak Period Split Failures (%)",
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Summary Trend
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Throughput Trend
            </Typography>
            <Plot
              data={[throughputTrend as any]}
              layout={{
                autosize: true,
                height: 300,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: { title: "Month" },
                yaxis: { title: "Vehicles per Hour (vph)" },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Arrivals on Green Trend
            </Typography>
            <Plot
              data={[arrivalsOnGreenTrend as any]}
              layout={{
                autosize: true,
                height: 300,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: { title: "Month" },
                yaxis: { title: "Percentage (%)" },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Split Failures Trend
            </Typography>
            <Plot
              data={[splitFailuresTrend as any]}
              layout={{
                autosize: true,
                height: 300,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: { title: "Month" },
                yaxis: { title: "Percentage (%)" },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

