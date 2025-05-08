import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    Box, 
    Tabs, 
    Tab, 
    Typography,
    Paper,
    Grid,
    CircularProgress,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    IconButton,
    Stack,
    FormControl
} from '@mui/material';
import Plot from 'react-plotly.js';
import TrafficIcon from '@mui/icons-material/Traffic';
import BuildIcon from '@mui/icons-material/Build';
import EngineeringIcon from '@mui/icons-material/Engineering';
import georgiaMap from '../assets/images/georgia_region_map.png';
import { RootState } from '../store/store';
import { 
    fetchMaintenanceMetrics, 
    fetchOperationsMetrics, 
    fetchSafetyMetrics, 
    fetchRegionAverages,
    fetchMetricsTrendData 
} from '../store/slices/metricsSlice';
import { AppDispatch } from '../store/store';
import { MaintenanceMetric, OperationsMetric, SafetyMetric } from '../api/healthMetricsApi';
import { metricsApi } from '../services/api/metricsApi';
import { FilterParams, MetricData, MetricsFilterRequest } from '../types/api.types';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    '&.MuiTableCell-head': {
        backgroundColor: '#4285f4',
        color: theme.palette.common.white,
        fontWeight: 'bold',
        padding: theme.spacing(1),
    },
    '&.MuiTableCell-body': {
        padding: theme.spacing(1),
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
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
    const dispatch = useDispatch<AppDispatch>();
    const regionsState = useSelector((state: RootState) => state.metrics.regions);

    useEffect(() => {
        const currentDate = new Date();
        const formattedMonth = `${currentDate.getMonth() + 1 < 10 ? '0' : ''}${currentDate.getMonth() + 1}-01-${currentDate.getFullYear()}`;
        dispatch(fetchRegionAverages(formattedMonth));
    }, [dispatch]);

    if (regionsState.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (regionsState.error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <Typography color="error">{regionsState.error}</Typography>
            </Box>
        );
    }

    const regionsData = [
        { name: 'NORTH', color: '#8BC34A', ...regionsState.north },
        { name: 'SOUTHWEST', color: '#42A5F5', ...regionsState.southwest },
        { name: 'SOUTHEAST', color: '#FFD54F', ...regionsState.southeast },
        { name: 'STATEWIDE', color: '#9E9E9E', ...regionsState.statewide },
        { name: 'WESTERN METRO', color: '#EF5350', ...regionsState.westernMetro },
        { name: 'CENTRAL METRO', color: '#1A237E', ...regionsState.centralMetro },
        { name: 'EASTERN METRO', color: '#546E7A', ...regionsState.easternMetro },
    ];

    const getStatusColor = (percentage: number = 0) => {
        if (percentage >= 75) return '#4CAF50';
        if (percentage >= 25) return '#FFC107';
        return '#F44336';
    };

    const RegionCard = ({ region }: { region: any }) => {
        const [operationsValue, setOperationsValue] = useState(0);
        const [maintenanceValue, setMaintenanceValue] = useState(0);
        const [safetyValue, setSafetyValue] = useState(0);

        // Animation effect that runs on component mount
        useEffect(() => {
            const duration = 100; // Animation duration in ms
            const interval = 10; // Update interval in ms
            const steps = duration / interval;
            
            let step = 0;
            
            const timer = setInterval(() => {
                step++;
                const progress = step / steps;
                
                // Easing function for smoother animation
                const easeOutQuad = (t: number) => t * (2 - t);
                const easedProgress = easeOutQuad(progress);
                
                setOperationsValue(Math.min(easedProgress * (region?.operations || 0), region?.operations || 0));
                setMaintenanceValue(Math.min(easedProgress * (region?.maintenance || 0), region?.maintenance || 0));
                setSafetyValue(Math.min(easedProgress * (region?.safety || 0), region?.safety || 0));
                
                if (step >= steps) {
                    clearInterval(timer);
                }
            }, interval);
            
            return () => clearInterval(timer);
        }, [region]);

        return (
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
                            value={operationsValue} 
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
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 5,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                backgroundColor: 'rgba(70,70,70,0.9)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                pointerEvents: 'none',
                                '&:hover': {
                                    opacity: 1
                                },
                                '.progress-wrapper:hover &': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="white">
                                {region?.operations?.toFixed(2) || '0.00'}%
                            </Typography>
                        </Box>
                    </div>
                    <Typography sx={{ fontSize: '0.8rem', color: 'blue' }}>Operation</Typography>
                </StatusCircle>
                <StatusCircle color={getStatusColor(region?.maintenance)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={maintenanceValue} 
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
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 5,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                backgroundColor: 'rgba(70,70,70,0.9)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                pointerEvents: 'none',
                                '&:hover': {
                                    opacity: 1
                                },
                                '.progress-wrapper:hover &': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="white">
                                {region?.maintenance?.toFixed(2) || '0.00'}%
                            </Typography>
                        </Box>
                    </div>
                    <Typography sx={{ fontSize: '0.8rem', color: 'blue' }}>Maintenance</Typography>
                </StatusCircle>
                <StatusCircle color={getStatusColor(region?.safety)}>
                    <div className="progress-wrapper">
                        <CircularProgress 
                            className="outer"
                            variant="determinate" 
                            value={safetyValue} 
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
                        <Box 
                            sx={{ 
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 5,
                                opacity: 0,
                                transition: 'opacity 0.3s',
                                backgroundColor: 'rgba(70,70,70,0.9)',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                pointerEvents: 'none',
                                '&:hover': {
                                    opacity: 1
                                },
                                '.progress-wrapper:hover &': {
                                    opacity: 1
                                }
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold" color="white">
                                {region?.safety?.toFixed(2) || '0.00'}%
                            </Typography>
                        </Box>
                    </div>
                    <Typography sx={{ fontSize: '0.8rem', color: 'blue' }}>Safety</Typography>
                </StatusCircle>
            </Box>
        </Box>
    );
    };

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
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }}>
            {/* Column 1 */}
            <RegionCard region={regionsData[0]} /> {/* 1,1 NORTH */}
            <RegionCard region={regionsData[3]} /> {/* 1,2 STATEWIDE */}
            <RegionCard region={regionsData[4]} /> {/* 1,3 WESTERN METRO */}

            {/* Column 2 */}
            <RegionCard region={regionsData[1]} /> {/* 2,1 SOUTHWEST */}
            <Box className="map-container">
                {/* <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>Georgia Regions</Typography> */}
                <Box 
                    component="img" 
                    src={georgiaMap} 
                    alt="Georgia Region Map"
                    sx={{
                        maxWidth: '100%',
                        maxHeight: '350px',
                        objectFit: 'contain'
                    }}
                />
            </Box>

            {/* Column 3 */}
            <RegionCard region={regionsData[5]} /> {/* 3,1 SOUTHEAST */}
            <RegionCard region={regionsData[2]} /> {/* 2,3 CENTRAL METRO */}
            <RegionCard region={regionsData[6]} /> {/* 3,3 EASTERN METRO */}
        </Box>
    );
};

interface MetricsTableProps {
    type: 'Maintenance' | 'Operations' | 'Safety';
}

const MetricsTable = ({ type }: MetricsTableProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        new Date('2025-04-01'),
        new Date('2025-05-01')
    ]);

    const { maintenance, operations, safety } = useSelector((state: RootState) => state.metrics);
    
    useEffect(() => {
        if (!dateRange[0] || !dateRange[1]) return;
        
        const startDate = dateRange[0].toISOString().split('T')[0].replace(/-/g, '-');
        const endDate = dateRange[1].toISOString().split('T')[0].replace(/-/g, '-');
        
        if (type === 'Maintenance' && !maintenance.data.length) {
            dispatch(fetchMaintenanceMetrics({ start: startDate, end: endDate }));
        } else if (type === 'Operations' && !operations.data.length) {
            dispatch(fetchOperationsMetrics({ start: startDate, end: endDate }));
        } else if (type === 'Safety' && !safety.data.length) {
            dispatch(fetchSafetyMetrics({ start: startDate, end: endDate }));
        }
    }, [dispatch, type, dateRange, maintenance.data.length, operations.data.length, safety.data.length]);

    const getTableData = () => {
        switch (type) {
            case 'Maintenance':
                return maintenance.data.map(item => ({
                    zoneGroup: item.zone_Group,
                    corridor: item.corridor,
                    percentHealth: `${(item['percent Health'] * 100).toFixed(2)}%`,
                    missingData: item['missing Data'] ?? 0,
                    detectionUpScore: item['detection Uptime Score'] ?? 0,
                    pedActuationScore: item['ped Actuation Uptime Score'] ?? 0,
                    commUtilScore: item['comm Uptime Score'] ?? 0,
                    cctvUtilScore: item['cctv Uptime Score'] ?? 0,
                    flashEventsScore: item['flash Events Score'] ?? 0,
                    detectionUp: item['detection Uptime'] ?? 0,
                    pedActuation: item['ped Actuation Uptime'] ?? 0,
                    commUtil: item['comm Uptime'] ?? 0,
                    cctvUtil: item['cctv Uptime'] ?? 0,
                    flashEvents: item['flash Events'] ?? 0,
                }));
            case 'Operations':
                return operations.data.map(item => ({
                    zoneGroup: item.zone_Group,
                    corridor: item.corridor,
                    percentHealth: `${(item['percent Health'] * 100).toFixed(2)}%`,
                    missingData: item['missing Data'] ?? 0,
                    platoonRatioScore: item['platoon Ratio Score'] ?? 0,
                    pedDelayScore: item['ped Delay Score'] ?? 0,
                    splitFailuresScore: item['split Failures Score'] ?? 0,
                    travelTimeIndexScore: item['travel Time Index Score'] ?? 0,
                    bufferIndexScore: item['buffer Index Score'] ?? 0,
                    platoonRatio: item['platoon Ratio'] ?? 0,
                    pedDelay: item['ped Delay'] ?? 0,
                    splitFailures: item['split Failures'] ?? 0,
                    travelTimeIndex: item['travel Time Index'] ?? 0,
                    bufferIndex: item['buffer Index'] ?? 0,
                }));
            case 'Safety':
                return safety.data.map(item => ({
                    zoneGroup: item.zone_Group,
                    corridor: item.corridor,
                    percentHealth: `${(item['percent Health'] * 100).toFixed(2)}%`,
                    missingData: item['missing Data'] ?? 0,
                    crashRateIndexScore: item['crash Rate Index Score'] ?? 0,
                    kabcoCrashSeverityIndexScore: item['kabco Crash Severity Index Score'] ?? 0,
                    highSpeedIndexScore: item['high Speed Index Score'] ?? 0,
                    pedInjuryExposureIndexScore: item['ped Injury Exposure Index Score'] ?? 0,
                    crashRateIndex: item['crash Rate Index'] ?? 0,
                    kabcoCrashSeverityIndex: item['kabco Crash Severity Index'] ?? 0,
                    highSpeedIndex: item['high Speed Index'] ?? 0,
                    pedInjuryExposureIndex: item['ped Injury Exposure Index'] ?? 0,
                }));
            default:
                return [];
        }
    };

    const getTableColumns = () => {
        switch (type) {
            case 'Maintenance':
                return [
                    { id: 'zoneGroup', label: 'Zone Group' },
                    { id: 'corridor', label: 'Corridor' },
                    { id: 'percentHealth', label: 'Percent Health' },
                    { id: 'missingData', label: 'Missing Data' },
                    { id: 'detectionUpScore', label: 'Detection Uptime Score' },
                    { id: 'pedActuationScore', label: 'Ped Actuation Uptime Score' },
                    { id: 'commUtilScore', label: 'Comm Uptime Score' },
                    { id: 'cctvUtilScore', label: 'CCTV Uptime Score' },
                    { id: 'flashEventsScore', label: 'Flash Events Score' },
                    { id: 'detectionUp', label: 'Detection Uptime' },
                    { id: 'pedActuation', label: 'Ped Actuation Uptime' },
                    { id: 'commUtil', label: 'Comm Uptime' },
                    { id: 'cctvUtil', label: 'CCTV Uptime' },
                    { id: 'flashEvents', label: 'Flash Events' },
                ];
            case 'Operations':
                return [
                    { id: 'zoneGroup', label: 'Zone Group' },
                    { id: 'corridor', label: 'Corridor' },
                    { id: 'percentHealth', label: 'Percent Health' },
                    { id: 'missingData', label: 'Missing Data' },
                    { id: 'platoonRatioScore', label: 'Platoon Ratio Score' },
                    { id: 'pedDelayScore', label: 'Ped Delay Score' },
                    { id: 'splitFailuresScore', label: 'Split Failures Score' },
                    { id: 'travelTimeIndexScore', label: 'Travel Time Index Score' },
                    { id: 'bufferIndexScore', label: 'Buffer Index Score' },
                    { id: 'platoonRatio', label: 'Platoon Ratio' },
                    { id: 'pedDelay', label: 'Ped Delay' },
                    { id: 'splitFailures', label: 'Split Failures' },
                    { id: 'travelTimeIndex', label: 'Travel Time Index' },
                    { id: 'bufferIndex', label: 'Buffer Index' },
                ];
            case 'Safety':
                return [
                    { id: 'zoneGroup', label: 'Zone Group' },
                    { id: 'corridor', label: 'Corridor' },
                    { id: 'percentHealth', label: 'Percent Health' },
                    { id: 'missingData', label: 'Missing Data' },
                    { id: 'crashRateIndexScore', label: 'Crash Rate Index Score' },
                    { id: 'kabcoCrashSeverityIndexScore', label: 'KABCO Crash Severity Index Score' },
                    { id: 'highSpeedIndexScore', label: 'High Speed Index Score' },
                    { id: 'pedInjuryExposureIndexScore', label: 'Ped Injury Exposure Index Score' },
                    { id: 'crashRateIndex', label: 'Crash Rate Index' },
                    { id: 'kabcoCrashSeverityIndex', label: 'KABCO Crash Severity Index' },
                    { id: 'highSpeedIndex', label: 'High Speed Index' },
                    { id: 'pedInjuryExposureIndex', label: 'Ped Injury Exposure Index' },
                ];
            default:
                return [];
        }
    };

    const data = getTableData();
    const columns = getTableColumns();

    // Filter data based on search inputs
    const filteredData = data.filter(row => {
        return Object.keys(filters).every(key => {
            const filterValue = filters[key]?.toLowerCase();
            if (!filterValue) return true;
            
            const cellValue = String(row[key as keyof typeof row] || '').toLowerCase();
            return cellValue.includes(filterValue);
        });
    });

    const handleFilterChange = (columnId: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
        setPage(0); // Reset to first page when filtering
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDateRange = (newDateRange: [Date | null, Date | null]) => {
        setDateRange(newDateRange);
        // Reset data to trigger a new fetch with the new date range
        if (type === 'Maintenance') {
            dispatch({ type: 'metrics/resetMaintenanceData' });
        } else if (type === 'Operations') {
            dispatch({ type: 'metrics/resetOperationsData' });
        } else if (type === 'Safety') {
            dispatch({ type: 'metrics/resetSafetyData' });
        }
    };

    const isLoading = 
        (type === 'Maintenance' && maintenance.loading) || 
        (type === 'Operations' && operations.loading) || 
        (type === 'Safety' && safety.loading);
    
    const error = 
        (type === 'Maintenance' && maintenance.error) || 
        (type === 'Operations' && operations.error) || 
        (type === 'Safety' && safety.error);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="h2">
                    {type} Metrics
                </Typography>
                
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateRangePicker
                        calendars={1}
                        value={dateRange}
                        onChange={handleChangeDateRange}
                        slotProps={{
                            textField: { 
                                size: 'small',
                                fullWidth: true,
                                InputProps: {
                                    startAdornment: (
                                        <IconButton edge="start" sx={{ mr: 1 }}>
                                            <CalendarTodayIcon fontSize="small" color="primary" />
                                        </IconButton>
                                    ),
                                }
                            },
                            field: { 
                                shouldRespectLeadingZeros: true,
                                format: 'MM/dd/yyyy'
                            },
                        }}
                        sx={{ 
                            width: 300,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#0070ed',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#0070ed',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#0070ed',
                                },
                            }
                        }}
                    />
                </LocalizationProvider>
            </Box>
            
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <StyledTableCell key={column.id}>
                                    <TextField 
                                        size="small"
                                        variant="outlined"
                                        label={column.label}
                                        value={filters[column.id] || ''}
                                        onChange={(e) => handleFilterChange(column.id, e.target.value)}
                                        fullWidth
                                        margin="dense"
                                        sx={{ 
                                            mt: 1,
                                            width: column.id === 'zoneGroup' || column.id === 'corridor' ? '100%' : '120px',
                                            '& .MuiOutlinedInput-root': { 
                                                bgcolor: '#0070ed',
                                                color: 'white',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'white',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'white',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                '&::placeholder': {
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    opacity: 1
                                                }
                                            },
                                            '& .MuiInputLabel-root': {
                                                color: 'white',
                                                fontSize: '0.75rem',
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                fontWeight: 'bold'
                                            },
                                        }}
                                    />
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, index) => (
                                <StyledTableRow key={index}>
                                    {columns.map((column) => (
                                        <StyledTableCell key={column.id}>
                                            {row[column.id as keyof typeof row]}
                                        </StyledTableCell>
                                    ))}
                                </StyledTableRow>
                        ))}
                        {filteredData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No results found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
};

interface TrendGraphsProps {
    type: 'maintenance' | 'operation' | 'safety';
}

const TrendGraphs: React.FC<TrendGraphsProps> = ({ type }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
    const [locationBarData, setLocationBarData] = useState<any>({});

    // Create filter params with the specific payload structure from the request
    const filterParams: FilterParams = {
        dateRange: 4,
        timePeriod: 4,
        customStart: null,
        customEnd: null,
        daysOfWeek: null,
        startTime: null,
        endTime: null,
        zone_Group: "Central Metro",
        zone: null,
        agency: null,
        county: null,
        city: null,
        corridor: null,
        signalId: "",
        priority: "",
        classification: "",
    };

    // Get measure code based on type
    const getMeasure = () => {
        switch(type) {
            case 'maintenance':
                return 'maint_plot';
            case 'operation':
                return 'ops_plot';
            case 'safety':
                return 'safety_plot';
            default:
                return 'maint_plot';
        }
    };

    // Get title based on type
    const getTimeSeriesTitle = () => {
        switch(type) {
            case 'maintenance':
                return 'Maintenance Health Metrics';
            case 'operation':
                return 'Operations Health Metrics';
            case 'safety':
                return 'Safety Health Metrics';
            default:
                return 'Health Metrics';
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const measure = getMeasure();
                const params: MetricsFilterRequest = {
                    source: 'main',
                    measure
                };
                
                // POST request to /metrics/filter for time series data
                const timeSeriesResponse = await metricsApi.getMetricsFilter(params, filterParams);
                
                // POST request to /metrics/average for location bar data
                const averageResponse = await metricsApi.getMetricsAverage({
                    ...params,
                    dashboard: false
                }, filterParams);
                
                // Also fetch straight average for reference
                const straightAverageResponse = await metricsApi.getStraightAverage(params, filterParams);
                
                console.log('Time Series Response:', timeSeriesResponse);
                console.log('Average Response:', averageResponse);
                console.log('Straight Average Response:', straightAverageResponse);

                // Process time series data
                setTimeSeriesData(processTimeSeriesData(timeSeriesResponse));
                
                // Process location bar data
                setLocationBarData(processLocationBarData(timeSeriesResponse, 
                    Array.isArray(averageResponse) ? averageResponse : []));
                
            } catch (err: any) {
                setError(err?.message || 'Failed to fetch trend data');
                console.error('Error fetching trend data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [type]);

    // Process time series data - Group by month/year for time series chart
    const processTimeSeriesData = (data: MetricData[]) => {
        if (!data?.length) return [];
        
        // Group by zone group or corridor
        const groupedData: Record<string, any[]> = {};
        
        data.forEach(item => {
            // Use month field or timestamp if available
            const dateStr = item.month || item.timestamp;
            if (!dateStr) return;
            
            const date = new Date(dateStr);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            
            // Get the group identifier (zoneGroup, corridor, or Unknown)
            const group = item.zoneGroup || item.corridor || 'Unknown';
            
            if (!groupedData[group]) {
                groupedData[group] = [];
            }
            
            // Check if we already have an entry for this month/year
            const existingEntry = groupedData[group].find(entry => entry.monthYear === monthYear);
            
            // Get value from percent Health (if it's a string, convert to number) or use value field
            const metricValue = typeof item['percent Health'] === 'string' 
                ? parseFloat(item['percent Health']) 
                : (item['percent Health'] || item.value || 0);
            
            if (existingEntry) {
                existingEntry.values.push(metricValue);
                existingEntry.count += 1;
            } else {
                groupedData[group].push({
                    monthYear,
                    date,
                    values: [metricValue],
                    count: 1
                });
            }
        });
        
        // Calculate averages and convert to Plotly format
        return Object.entries(groupedData).map(([group, points]) => {
            // Sort by date
            points.sort((a, b) => a.date.getTime() - b.date.getTime());
            
            return {
                x: points.map(p => p.monthYear),
                y: points.map(p => {
                    const sum = p.values.reduce((acc: number, val: number) => acc + val, 0);
                    return p.count > 0 ? sum / p.count : 0;
                }),
                type: 'scatter',
                mode: 'lines+markers',
                name: group
            };
        });
    };
    
    // Process location bar data - sort by label for the bar chart
    const processLocationBarData = (data: MetricData[], averageData: any[] = []) => {
        if (!data?.length && !averageData?.length) return { x: [], y: [], type: 'bar', orientation: 'h' };
        
        // If we have average data use that instead - it has better formatting with labels
        if (averageData?.length) {
            const sortedData = [...averageData]
                .map(item => ({
                    location: item.label || 'Unknown',
                    average: item.avg || 0,
                    label: item.label // Use the label from the response
                }))
                .sort((a, b) => a.average - b.average);
            
            return {
                x: sortedData.map(item => item.average),
                y: sortedData.map(item => item.location),
                type: 'bar',
                orientation: 'h'
            };
        }
        
        // Fallback to using timeSeriesData if no averageData is available
        // Aggregate by corridor or zoneGroup as the location identifier
        const aggregatedData: Record<string, { sum: number, count: number, label: string }> = {};
        
        data.forEach(item => {
            const location = item.corridor || item.zoneGroup || 'Unknown';
            
            if (!aggregatedData[location]) {
                aggregatedData[location] = { sum: 0, count: 0, label: location };
            }
            
            // Get the value from percent Health or value field
            const metricValue = typeof item['percent Health'] === 'string'
                ? parseFloat(item['percent Health'])
                : (item['percent Health'] || item.value || 0);
            
            aggregatedData[location].sum += metricValue;
            aggregatedData[location].count += 1;
        });
        
        // Calculate averages and sort
        const sortedData = Object.entries(aggregatedData)
            .map(([key, { sum, count, label }]) => ({
                location: key,
                average: count > 0 ? sum / count : 0,
                label: label // Use the label from the response
            }))
            .sort((a, b) => a.average - b.average);
        
        return {
            x: sortedData.map(item => item.average),
            y: sortedData.map(item => item.label),
            type: 'bar',
            orientation: 'h'
        };
    };
    
    // Helper function for time series chart data
    const timeSeriesChartData = () => {
        if (!timeSeriesData.length) {
            return [{
                x: [],
                y: [],
                type: 'scatter',
                mode: 'lines+markers'
            }];
        }
        return timeSeriesData;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    {getTimeSeriesTitle()}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    {/* Location Bar Chart */}
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Plot
                            data={[locationBarData]}
                layout={{
                    autosize: true,
                                height: 500,
                                margin: { l: 150, r: 10, t: 10, b: 50 },
                                yaxis: {
                                    title: "",
                                    automargin: true,
                                    tickfont: { size: 10 },
                                },
                    xaxis: {
                                    title: "Health Score",
                                    tickformat: '.1%',
                                    range: [0, 1],
                                    dtick: 0.2
                                },
                            }}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </Box>

                    {/* Time Series Chart */}
                    <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <Plot
                            data={timeSeriesChartData()}
                layout={{
                    autosize: true,
                                height: 500,
                                margin: { l: 50, r: 10, t: 10, b: 50 },
                                xaxis: { title: "Month & Year" },
                                yaxis: {
                                    title: "Health Score",
                                    tickformat: '.1%',
                                    range: [0, 1],
                                    dtick: 0.2
                                },
                                // showlegend: true,
                                // legend: { x: 0, y: 1 },
                            }}
                            style={{ width: "100%", height: "100%" }}
                        />
                    </Box>
                </Box>
            </Paper>
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
                <MetricsTable type="Maintenance" />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <TrendGraphs type="maintenance" />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <MetricsTable type="Operations" />
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
                <TrendGraphs type="operation" />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
                <MetricsTable type="Safety" />
            </TabPanel>
            <TabPanel value={tabValue} index={6}>
                <TrendGraphs type="safety" />
            </TabPanel>
        </Box>
    );
};

export default HealthMetrics;