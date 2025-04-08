import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Plot from "react-plotly.js"

export default function Maintenance() {
  // Sample data for charts
  const pieData = {
    values: [35, 25, 20, 15, 5],
    labels: ["Signal Timing", "Hardware Failure", "Power Issues", "Communication", "Other"],
    type: "pie",
    marker: {
      colors: ["#1976d2", "#4caf50", "#ff9800", "#f44336", "#9c27b0"],
    },
  }

  const timelineData = {
    x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    y: [12, 15, 8, 10, 7, 9, 11, 14, 10, 8, 13, 9],
    type: "scatter",
    mode: "lines+markers",
    marker: { color: "#f44336" },
    name: "Maintenance Events",
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Maintenance Types
            </Typography>
            <Plot
              data={[pieData as any]}
              layout={{
                autosize: true,
                height: 350,
                margin: { l: 20, r: 20, t: 20, b: 20 },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Maintenance Events Over Time
            </Typography>
            <Plot
              data={[timelineData as any]}
              layout={{
                autosize: true,
                height: 350,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: { title: "Month" },
                yaxis: { title: "Number of Events" },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

