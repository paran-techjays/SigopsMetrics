import { useState } from 'react';
import { 
    Box, 
    Tabs, 
    Tab, 
    Typography,
    Paper,
    Grid,
    CircularProgress,
    styled
} from '@mui/material';
import TrafficIcon from '@mui/icons-material/Traffic';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const RegionHeader = styled(Paper)(({ theme, color }) => ({
    padding: theme.spacing(1),
    textAlign: 'center',
    color: '#fff',
    backgroundColor: color,
    borderRadius: '20px',
    marginBottom: theme.spacing(2)
}));

const StatusCircle = styled(Box)(({ theme, color }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& .progress-wrapper': {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        '& .MuiCircularProgress-root': {
            position: 'absolute',
            '&.outer': {
                color: color,
                transform: 'scale(1.4)',
                '& .MuiCircularProgress-svg': {
                    strokeLinecap: 'round'
                }
            },
            '&.inner': {
                color: theme.palette.mode === 'light' 
                    ? `${color}40`
                    : `${color}80`,
                '& .MuiCircularProgress-svg': {
                    strokeLinecap: 'round'
                }
            }
        },
        '& .icon': {
            position: 'absolute',
            color: color,
            fontSize: '24px',
            zIndex: 1
        }
    }
}));

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const RegionStatus = () => {
    const regions = [
        { name: 'NORTH', color: '#8BC34A', operations: 20, maintenance: 15, safety: 45 },
        { name: 'SOUTHWEST', color: '#42A5F5', operations: 80, maintenance: 90, safety: 85 },
        { name: 'SOUTHEAST', color: '#FFD54F', operations: 95, maintenance: 88, safety: 92 },
        { name: 'STATEWIDE', color: '#9E9E9E', operations: 85, maintenance: 60, safety: 78 },
        { name: 'WESTERN METRO', color: '#EF5350', operations: 82, maintenance: 35, safety: 88 },
        { name: 'CENTRAL METRO', color: '#1A237E', operations: 79, maintenance: 81, safety: 77 },
        { name: 'EASTERN METRO', color: '#546E7A', operations: 40, maintenance: 55, safety: 89 },
    ];

    const getStatusColor = (percentage: number) => {
        if (percentage >= 75) return '#4CAF50';
        if (percentage >= 25) return '#FFC107';
        return '#F44336';
    };

    const RegionCard = ({ region }: { region: typeof regions[0] }) => (
        <Box>
            <RegionHeader color={region?.color}>
                <Typography sx={{ fontSize: '0.8rem' }}>{region?.name}</Typography>
            </RegionHeader>
            <Box display="flex" justifyContent="space-around" mb={2}>
                <StatusCircle color={getStatusColor(region?.operations)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={region?.operations} 
                            size={80}
                            thickness={4}
                        />
                        <CircularProgress 
                            className="inner"
                            variant="determinate" 
                            value={100} 
                            size={60}
                            thickness={3}
                        />
                        <TrafficIcon className="icon" />
                    </div>
                    <Typography sx={{ fontSize: '0.8rem', color: 'blue' }}>Operation</Typography>
                </StatusCircle>
                <StatusCircle color={getStatusColor(region?.maintenance)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={region?.maintenance} 
                            size={80}
                            thickness={4}
                        />
                        <CircularProgress 
                            className="inner"
                            variant="determinate" 
                            value={100} 
                            size={60}
                            thickness={3}
                        />
                        <BuildIcon className="icon" />
                    </div>
                    <Typography sx={{ fontSize: '0.8rem', color: 'blue' }}>Maintenance</Typography>
                </StatusCircle>
                <StatusCircle color={getStatusColor(region?.safety)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={region?.safety} 
                            size={80}
                            thickness={4}
                        />
                        <CircularProgress 
                            className="inner"
                            variant="determinate" 
                            value={100} 
                            size={60}
                            thickness={3}
                        />
                        <EngineeringIcon className="icon" />
                    </div>
                    <Typography sx={{ fontSize: '0.8rem', color: 'blue' }}>Safety</Typography>
                </StatusCircle>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, auto)',
            gap: 3,
            '& .map-container': {
                gridColumn: '2',
                gridRow: '2 / span 2',
                bgcolor: 'background.paper',
                borderRadius: 1,
                p: 2,
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }}>
            {/* Column 1 */}
            <RegionCard region={regions[0]} /> {/* 1,1 NORTH */}
            <RegionCard region={regions[3]} /> {/* 1,2 STATEWIDE */}
            <RegionCard region={regions[4]} /> {/* 1,3 WESTERN METRO */}

            {/* Column 2 */}
            <RegionCard region={regions[1]} /> {/* 2,1 SOUTHWEST */}
            <Box className="map-container">
                <Typography variant="h6" color="text.secondary">Georgia Map</Typography>
            </Box>

            {/* Column 3 */}
            <RegionCard region={regions[5]} /> {/* 3,1 SOUTHEAST */}
            <RegionCard region={regions[2]} /> {/* 2,3 CENTRAL METRO */}
            <RegionCard region={regions[6]} /> {/* 3,3 EASTERN METRO */}
        </Box>
    );
};

const HealthMetrics = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab label="Region Status" />
                    <Tab label="Maintenance" />
                    <Tab label="Maintenance Trend" />
                    <Tab label="Operations" />
                    <Tab label="Operation Trend" />
                    <Tab label="Safety" />
                    <Tab label="Safety Trend" />
                </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
                <RegionStatus />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <Typography>Maintenance Content</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <Typography>Maintenance Trend Content</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <Typography>Operations Content</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
                <Typography>Operation Trend Content</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
                <Typography>Safety Content</Typography>
            </TabPanel>
            <TabPanel value={tabValue} index={6}>
                <Typography>Safety Trend Content</Typography>
            </TabPanel>
        </Box>
    );
};

export default HealthMetrics;