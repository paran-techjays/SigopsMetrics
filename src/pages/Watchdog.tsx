import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Chip from "@mui/material/Chip"
import Plot from "react-plotly.js"

export default function Watchdog() {
  // Sample data for alerts
  const alerts = [
    {
      id: 1,
      intersection: "Main St & 5th Ave",
      type: "Communication Failure",
      status: "Critical",
      time: "2025-04-01 08:15",
    },
    { id: 2, intersection: "Broadway & 10th St", type: "Detector Fault", status: "Warning", time: "2025-04-01 09:30" },
    {
      id: 3,
      intersection: "Park Ave & 42nd St",
      type: "Signal Timing Issue",
      status: "Warning",
      time: "2025-04-01 10:45",
    },
    { id: 4, intersection: "Market St & 3rd Ave", type: "Power Outage", status: "Critical", time: "2025-04-01 11:20" },
    { id: 5, intersection: "Oak St & Pine Ave", type: "Cabinet Door Open", status: "Info", time: "2025-04-01 12:10" },
  ]

  // Sample data for chart
  const alertsOverTime = {
    x: ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
    y: [2, 1, 0, 1, 5, 8, 6, 4, 7, 10, 5, 3],
    type: "scatter",
    mode: "lines+markers",
    marker: { color: "#f44336" },
    name: "Alerts",
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Watchdog
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Intersection</TableCell>
                    <TableCell>Alert Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.intersection}</TableCell>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={alert.status}
                          color={
                            alert.status === "Critical" ? "error" : alert.status === "Warning" ? "warning" : "info"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{alert.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Alerts Over Time
            </Typography>
            <Plot
              data={[alertsOverTime as any]}
              layout={{
                autosize: true,
                height: 350,
                margin: { l: 50, r: 20, t: 20, b: 50 },
                xaxis: { title: "Time of Day" },
                yaxis: { title: "Number of Alerts" },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

