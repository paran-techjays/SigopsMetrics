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
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import SearchIcon from "@mui/icons-material/Search"

export default function SignalInfo() {
  // Sample data for signals
  const signals = [
    { id: "001", name: "Main St & 5th Ave", type: "Fixed Time", status: "Online", lastUpdated: "2025-04-01 08:15" },
    { id: "002", name: "Broadway & 10th St", type: "Actuated", status: "Online", lastUpdated: "2025-04-01 09:30" },
    { id: "003", name: "Park Ave & 42nd St", type: "Adaptive", status: "Online", lastUpdated: "2025-04-01 10:45" },
    { id: "004", name: "Market St & 3rd Ave", type: "Actuated", status: "Offline", lastUpdated: "2025-04-01 11:20" },
    { id: "005", name: "Oak St & Pine Ave", type: "Fixed Time", status: "Online", lastUpdated: "2025-04-01 12:10" },
  ]

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Signal Info
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", mb: 3 }}>
              <TextField
                label="Search Signals"
                variant="outlined"
                size="small"
                fullWidth
                sx={{ maxWidth: 500, mr: 2 }}
              />
              <Button variant="contained" startIcon={<SearchIcon />}>
                Search
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Signal ID</TableCell>
                    <TableCell>Intersection</TableCell>
                    <TableCell>Signal Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {signals.map((signal) => (
                    <TableRow key={signal.id}>
                      <TableCell>{signal.id}</TableCell>
                      <TableCell>{signal.name}</TableCell>
                      <TableCell>{signal.type}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            color: signal.status === "Online" ? "success.main" : "error.main",
                            fontWeight: "medium",
                          }}
                        >
                          {signal.status}
                        </Box>
                      </TableCell>
                      <TableCell>{signal.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

