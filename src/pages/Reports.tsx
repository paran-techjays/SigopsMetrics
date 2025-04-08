import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardActions from "@mui/material/CardActions"
import Button from "@mui/material/Button"
import DescriptionIcon from "@mui/icons-material/Description"
import BarChartIcon from "@mui/icons-material/BarChart"
import TimelineIcon from "@mui/icons-material/Timeline"
import DownloadIcon from "@mui/icons-material/Download"
import PrintIcon from "@mui/icons-material/Print"

export default function Reports() {
  // Sample data for reports
  const reportCategories = [
    { id: 1, name: "Performance Reports", icon: <BarChartIcon /> },
    { id: 2, name: "Maintenance Reports", icon: <TimelineIcon /> },
    { id: 3, name: "System Health Reports", icon: <DescriptionIcon /> },
  ]

  const recentReports = [
    { id: 1, name: "Monthly Performance Summary", date: "2025-04-01", category: "Performance" },
    { id: 2, name: "Quarterly Maintenance Report", date: "2025-03-31", category: "Maintenance" },
    { id: 3, name: "Annual System Health Analysis", date: "2025-03-15", category: "System Health" },
    { id: 4, name: "Weekly Incident Report", date: "2025-03-28", category: "Performance" },
  ]

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Report Categories
            </Typography>
            <List>
              {reportCategories.map((category) => (
                <ListItem key={category.id} disablePadding>
                  <ListItemButton>
                    <ListItemIcon>{category.icon}</ListItemIcon>
                    <ListItemText primary={category.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>
            <Grid container spacing={2}>
              {recentReports.map((report) => (
                <Grid item xs={12} sm={6} key={report.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {report.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Category: {report.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Generated: {report.date}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" startIcon={<DownloadIcon />}>
                        Download
                      </Button>
                      <Button size="small" startIcon={<PrintIcon />}>
                        Print
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

