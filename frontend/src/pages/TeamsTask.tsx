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
import LinearProgress from "@mui/material/LinearProgress"
import Plot from "react-plotly.js"

export default function TeamsTask() {
  // Sample data for tasks
  const tasks = [
    {
      id: 1,
      name: "Signal Timing Optimization",
      assignee: "John Smith",
      status: "In Progress",
      priority: "High",
      progress: 65,
    },
    { id: 2, name: "Hardware Replacement", assignee: "Jane Doe", status: "Pending", priority: "Medium", progress: 30 },
    {
      id: 3,
      name: "Communication System Upgrade",
      assignee: "Mike Johnson",
      status: "Completed",
      priority: "High",
      progress: 100,
    },
    {
      id: 4,
      name: "Detector Maintenance",
      assignee: "Sarah Williams",
      status: "In Progress",
      priority: "Low",
      progress: 45,
    },
    {
      id: 5,
      name: "Cabinet Inspection",
      assignee: "Robert Brown",
      status: "Not Started",
      priority: "Medium",
      progress: 0,
    },
  ]

  // Sample data for chart
  const tasksByStatus = {
    values: [8, 12, 5, 3],
    labels: ["Completed", "In Progress", "Pending", "Not Started"],
    type: "pie",
    marker: {
      colors: ["#4caf50", "#2196f3", "#ff9800", "#f44336"],
    },
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        TEAMS Tasks
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Tasks
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Name</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.name}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={
                            task.status === "Completed"
                              ? "success"
                              : task.status === "In Progress"
                                ? "primary"
                                : task.status === "Pending"
                                  ? "warning"
                                  : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority}
                          color={task.priority === "High" ? "error" : task.priority === "Medium" ? "warning" : "info"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box sx={{ width: "100%", mr: 1 }}>
                            <LinearProgress variant="determinate" value={task.progress} />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">{`${task.progress}%`}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Status
            </Typography>
            <Plot
              data={[tasksByStatus as any]}
              layout={{
                autosize: true,
                height: 350,
                margin: { l: 20, r: 20, t: 20, b: 20 },
              }}
              style={{ width: "100%" }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

