import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Grid from "@mui/material/Grid"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import AddIcon from "@mui/icons-material/Add"
import RemoveIcon from "@mui/icons-material/Remove"
import Divider from "@mui/material/Divider"

export default function About() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        About SigOps Metrics
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 0, height: "100%" }}>
            <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
              Performance
            </Typography>
            <Divider />

            <AccordionItem
              title="Throughput"
              content={
                <>
                  <Typography paragraph>
                    Throughput is a measure of efficiency. It is meant to represent the maximum number of vehicles
                    served on all phases at an intersection.
                  </Typography>
                  <Typography paragraph>
                    The number shown for the average is an average of all the individual signals based on the current
                    filter. The charts display an average of every signal in the respective corridor.
                  </Typography>
                  <Typography paragraph>
                    It is calculated as the highest 15-minute volume in a day at an intersection, converted to an hourly
                    volume. Volumes come from high-resolution event logs from the controller, which are stored in the
                    ATSPM database. All detectors used for volume counts are used in the throughput calculation for an
                    intersection. It includes Tuesdays, Wednesdays and Thursdays only.
                  </Typography>
                  <Typography paragraph>
                    Detectors used for volume counts are selected based on a hierarchy, as there may be more than one
                    detector in a given lane. For each lane, the detector with the highest count priority is selected
                    for the count-based metrics. The priority scale is as follows:
                  </Typography>
                  <ul>
                    <li>
                      <Typography>Exit</Typography>
                    </li>
                    <li>
                      <Typography>Advanced Count</Typography>
                    </li>
                    <li>
                      <Typography>Lane-by-lane Count</Typography>
                    </li>
                  </ul>
                </>
              }
            />

            <AccordionItem
              title="Arrivals on Green"
              content={
                <Typography paragraph>
                  Arrivals on Green represents the percentage of vehicles that arrive at a signalized intersection
                  during the green phase. Higher values indicate better progression and coordination between signals.
                </Typography>
              }
            />

            <AccordionItem
              title="Progression Ratio"
              content={
                <Typography paragraph>
                  Progression Ratio is a measure of the quality of traffic signal timing progression. A ratio greater
                  than 1.0 indicates good progression with vehicles moving efficiently through successive green lights.
                </Typography>
              }
            />

            <AccordionItem
              title="Queue Spillback Rate"
              content={
                <Typography paragraph>
                  Queue Spillback Rate measures the percentage of cycles where traffic queues extend beyond the
                  available storage capacity, potentially blocking upstream intersections or driveways.
                </Typography>
              }
            />

            <AccordionItem
              title="Split Failures"
              content={
                <Typography paragraph>
                  Split Failures occur when a signal phase terminates with a queue of vehicles still waiting. This
                  metric indicates the percentage of cycles that fail to clear all waiting vehicles during a single
                  green phase.
                </Typography>
              }
            />

            <AccordionItem
              title="Travel Time Index"
              content={
                <Typography paragraph>
                  Travel Time Index (TTI) is the ratio of the travel time during peak periods to the travel time during
                  free-flow conditions. A TTI of 1.3 means that a trip takes 30% longer during peak periods than during
                  free-flow conditions.
                </Typography>
              }
            />

            <AccordionItem
              title="Planning Time Index"
              content={
                <Typography paragraph>
                  Planning Time Index (PTI) represents the total travel time that should be planned for a trip to ensure
                  on-time arrival 95% of the time. It accounts for both recurring and non-recurring congestion.
                </Typography>
              }
            />

            <AccordionItem
              title="Daily Volume"
              content={
                <Typography paragraph>
                  Daily Volume represents the total number of vehicles that pass through an intersection in a 24-hour
                  period, typically averaged across multiple weekdays.
                </Typography>
              }
            />

            <AccordionItem
              title="Pedestrians"
              content={
                <Typography paragraph>
                  This metric tracks pedestrian activity at intersections, measured by pedestrian pushbutton activations
                  or pedestrian detections, providing insights into non-vehicular traffic patterns.
                </Typography>
              }
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 0, height: "100%" }}>
            <Typography variant="h6" sx={{ p: 2, fontWeight: "bold" }}>
              Volume & Equipment
            </Typography>
            <Divider />

            <AccordionItem
              title="Detector Uptime"
              content={
                <Typography paragraph>
                  Detector Uptime measures the percentage of time that vehicle detection equipment is functioning
                  properly. Higher values indicate more reliable detection systems.
                </Typography>
              }
            />

            <AccordionItem
              title="Pedestrian Pushbutton Uptime"
              content={
                <Typography paragraph>
                  Pedestrian Pushbutton Uptime tracks the reliability of pedestrian pushbuttons at intersections. It
                  measures the percentage of time these devices are functioning correctly.
                </Typography>
              }
            />

            <AccordionItem
              title="CCTV Uptime"
              content={
                <Typography paragraph>
                  CCTV Uptime indicates the percentage of time that closed-circuit television cameras at intersections
                  are operational, allowing traffic operators to visually monitor conditions.
                </Typography>
              }
            />

            <AccordionItem
              title="Communications Uptime"
              content={
                <Typography paragraph>
                  Communications Uptime measures the reliability of the communications network connecting traffic
                  signals to the central management system, reported as a percentage of time with successful
                  connectivity.
                </Typography>
              }
            />

            <AccordionItem
              title="Events Reported, Resolved, Outstanding"
              content={
                <Typography paragraph>
                  This metric tracks the total number of maintenance and operational events that have been reported, how
                  many have been resolved, and how many remain outstanding, providing insight into the efficiency of the
                  maintenance program.
                </Typography>
              }
            />

            <AccordionItem
              title="RTOP Activity Logs"
              content={
                <Typography paragraph>
                  RTOP (Regional Traffic Operations Program) Activity Logs document actions taken by traffic engineers
                  and technicians to optimize signal timing and respond to incidents, providing an audit trail of
                  operational changes.
                </Typography>
              }
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

// Custom accordion item component with + and - icons
function AccordionItem({ title, content }) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        "&:before": { display: "none" },
        "&.Mui-expanded": { margin: 0 },
      }}
    >
      <AccordionSummary
        expandIcon={<AddIcon />}
        aria-controls={`${title}-content`}
        id={`${title}-header`}
        sx={{
          flexDirection: "row-reverse",
          minHeight: "48px",
          "& .MuiAccordionSummary-content": { margin: "12px 0" },
          "&.Mui-expanded": { minHeight: "48px" },
        }}
      >
        <Typography sx={{ display: "flex", alignItems: "center", fontWeight: "medium" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 0, pb: 2 }}>{content}</AccordionDetails>
    </Accordion>
  )
}
