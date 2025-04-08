import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"

export default function About() {
  // Sample team members
  const teamMembers = [
    { id: 1, name: "John Smith", title: "Lead Developer", image: "/placeholder.svg?height=150&width=150" },
    { id: 2, name: "Jane Doe", title: "Traffic Engineer", image: "/placeholder.svg?height=150&width=150" },
    { id: 3, name: "Mike Johnson", title: "Data Scientist", image: "/placeholder.svg?height=150&width=150" },
  ]

  // Sample version history
  const versionHistory = [
    { version: "3.2.1", date: "2025-03-15", notes: "Added new filter options and improved map performance" },
    {
      version: "3.1.0",
      date: "2025-02-01",
      notes: "Integrated real-time traffic data and enhanced reporting capabilities",
    },
    { version: "3.0.5", date: "2025-01-10", notes: "Bug fixes and UI improvements" },
    { version: "3.0.0", date: "2024-12-01", notes: "Major release with new dashboard design and advanced analytics" },
  ]

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        About SigOps Metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" paragraph>
              SigOps Metrics is designed to provide traffic engineers and transportation professionals with
              comprehensive, real-time insights into traffic signal operations. Our platform helps agencies optimize
              traffic flow, reduce congestion, and improve overall mobility in urban environments.
            </Typography>
            <Typography variant="body1" paragraph>
              By combining advanced data analytics with intuitive visualization tools, SigOps Metrics transforms complex
              traffic data into actionable intelligence, enabling better decision-making and more efficient resource
              allocation.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Our Team
          </Typography>
          <Grid container spacing={2}>
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="150"
                    image={member.image}
                    alt={member.name}
                    sx={{ objectFit: "contain", bgcolor: "grey.100" }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h5" gutterBottom>
              Version History
            </Typography>
            <List>
              {versionHistory.map((item, index) => (
                <Box key={item.version}>
                  <ListItem alignItems="flex-start">
                    <ListItemText primary={`Version ${item.version} (${item.date})`} secondary={item.notes} />
                  </ListItem>
                  {index < versionHistory.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 SigOps Metrics. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Version 3.2.1
        </Typography>
      </Box>
    </Box>
  )
}

