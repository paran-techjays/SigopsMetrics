import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import SendIcon from "@mui/icons-material/Send"

export default function Contact() {
  // Sample contact info
  const contactInfo = [
    { id: 1, type: "Email", value: "support@sigops.com", icon: <EmailIcon /> },
    { id: 2, type: "Phone", value: "(555) 123-4567", icon: <PhoneIcon /> },
    { id: 3, type: "Address", value: "123 Traffic Way, Metro City, MC 12345", icon: <LocationOnIcon /> },
  ]

  // Sample inquiry types
  const inquiryTypes = [
    { value: "technical", label: "Technical Support" },
    { value: "account", label: "Account Management" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" },
  ]

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Send us a message
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="First Name" variant="outlined" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Last Name" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Email" variant="outlined" type="email" />
                </Grid>
                <Grid item xs={12}>
                  <TextField select required fullWidth label="Inquiry Type" variant="outlined" defaultValue="">
                    {inquiryTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Message" variant="outlined" multiline rows={4} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" endIcon={<SendIcon />} size="large">
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <List>
              {contactInfo.map((info) => (
                <ListItem key={info.id}>
                  <ListItemIcon>{info.icon}</ListItemIcon>
                  <ListItemText primary={info.type} secondary={info.value} />
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Office Hours
            </Typography>
            <Typography variant="body1">Monday - Friday: 8:00 AM - 5:00 PM</Typography>
            <Typography variant="body1">Saturday - Sunday: Closed</Typography>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Support Hours
            </Typography>
            <Typography variant="body1">24/7 Technical Support Available</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

