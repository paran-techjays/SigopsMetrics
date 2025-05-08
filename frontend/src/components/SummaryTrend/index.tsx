import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Grid, Box, CircularProgress, Typography } from '@mui/material';
import LineGraph from '../LineGraph';
import { Graph } from '../../utils/graph';
import { Metrics } from '../../utils/metrics';
import { Colors } from '../../utils/colors';
import { useAppDispatch, useAppSelector } from '../../hooks/useTypedSelector';
import { fetchSummaryTrends } from '../../store/slices/summaryTrendSlice';
import { FilterParams } from '../../types/api.types';

const SummaryTrend: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector(state => state.summaryTrend);
  const [filterState, setFilterState] = useState<FilterParams>({
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
    classification: ""
  });
  
  // Strings for metric names that may change based on time period
  const [aogString, setAogString] = useState('aogd');
  const [prString, setPrString] = useState('prd');
  const [qsString, setQsString] = useState('qsd');
  const [sfString, setSfString] = useState('sfd');
  const [vpString, setVpString] = useState('vpd');
  const [papString, setPapString] = useState('papd');
  
  const colors = new Colors();
  
  // Define metrics and graph configurations
  // Performance metrics
  const tpGraphMetrics = new Metrics({
    measure: "tp",
  });
  const tpGraph: Graph = {
    x: "month",
    y: "vph",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const tpTitle = "Throughput";

  const aogGraphMetrics = new Metrics({
    measure: "aogd",
    formatDecimals: 1,
    formatType: "percent",
  });
  const aogGraph: Graph = {
    x: "month",
    y: "aog",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const aogTitle = "Arrivals on Green";

  const prdGraphMetrics = new Metrics({
    measure: "prd",
    formatDecimals: 2,
  });
  const prdGraph: Graph = {
    x: "month",
    y: "pr",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const prdTitle = "Progression Ratio";

  const qsdGraphMetrics = new Metrics({
    measure: "qsd",
    formatDecimals: 1,
    formatType: "percent",
  });
  const qsdGraph: Graph = {
    x: "month",
    y: "qs_freq",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };
  const qsdTitle = "Queue Spillback";

  const sfdTitle = "Peak Period Split Failure";
  const sfdGraphMetrics = new Metrics({
    measure: "sfd",
    formatDecimals: 1,
    formatType: "percent",
  });
  const sfGraph: Graph = {
    x: "month",
    y: "sf_freq",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };

  const sfoTitle = "Off-Peak Split Failure";
  const sfoGraphMetrics = new Metrics({
    measure: "sfo",
    formatDecimals: 1,
    formatType: "percent",
  });

  const ttiTitle = "Travel Time Index";
  const ttiGraphMetrics = new Metrics({
    measure: "tti",
    formatDecimals: 2,
    goal: 1.5, // This would ideally come from AppConfig.settings.ttiGoal
  });
  const ttiGraph: Graph = {
    x: "month",
    y: "tti",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };

  const ptiTitle = "Planning Time Index";
  const ptiGraphMetrics = new Metrics({
    measure: "pti",
    formatDecimals: 2,
    goal: 2.0, // This would ideally come from AppConfig.settings.ptiGoal
  });
  const ptiGraph: Graph = {
    x: "month",
    y: "pti",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.2f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsGreen,
  };

  // Volume and Equipment metrics
  const dtvTitle = "Daily Volume";
  const dtvGraphMetrics = new Metrics({
    measure: "vpd",
  });
  const dtvGraph: Graph = {
    x: "month",
    y: "vpd",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const amvTitle = "AM Hourly Volume";
  const amvGraphMetrics = new Metrics({
    measure: "vphpa",
  });
  const amvGraph: Graph = {
    x: "month",
    y: "vph",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const pmvTitle = "PM Hourly Volume";
  const pmvGraphMetrics = new Metrics({
    measure: "vphpp",
  });
  const pmvGraph: Graph = {
    x: "month",
    y: "vph",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const paTitle = "Pedestrian Activations";
  const paGraphMetrics = new Metrics({
    measure: "papd",
  });
  const paGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.0f}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsBlue,
  };

  const duTitle = "Detector Uptime";
  const duGraphMetrics = new Metrics({
    measure: "du",
    formatDecimals: 1,
    formatType: "percent",
    goal: 0.85, // This would ideally come from AppConfig.settings.duGoal
  });
  const duGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  const pauTitle = "Ped Pushbutton Uptime";
  const pauGraphMetrics = new Metrics({
    measure: "pau",
    formatDecimals: 1,
    formatType: "percent",
    goal: 0.95, // This would ideally come from AppConfig.settings.ppuGoal
  });
  const pauGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  const cctvTitle = "CCTV Uptime";
  const cctvGraphMetrics = new Metrics({
    measure: "cctv",
    formatDecimals: 1,
    formatType: "percent",
    goal: 0.90, // This would ideally come from AppConfig.settings.cctvGoal
  });
  const cctvGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  const cuTitle = "Comm Uptime";
  const cuGraphMetrics = new Metrics({
    measure: "cu",
    formatDecimals: 1,
    formatType: "percent",
    goal: 0.95, // This would ideally come from AppConfig.settings.cuGoal
  });
  const cuGraph: Graph = {
    x: "month",
    y: "uptime",
    hoverTemplate: "<b>%{x}</b>" + ", <b>%{y:.1%}</b>" + "<extra></extra>",
    lineColor: colors.sigOpsRed,
  };

  // Function to update metric strings based on time period
  const setHourlyStrings = (filter: FilterParams) => {
    if (filter?.timePeriod === 1 || filter?.timePeriod === 0) {
      // update to hourly
      setAogString('aogh');
      setPrString('prh');
      setQsString('qsh');
      setSfString('sfh');
      setVpString('vph');
      setPapString('paph');
    } else {
      setAogString('aogd');
      setPrString('prd');
      setQsString('qsd');
      setSfString('sfd');
      setVpString('vpd');
      setPapString('papd');
    }
  };

  useEffect(() => {
    // Fetch summary trends data
    dispatch(fetchSummaryTrends(filterState));
    setHourlyStrings(filterState);
  }, [dispatch, filterState]);

  // Handle filter changes from FilterChipList
  const handleFilterChange = (newFilter: Partial<FilterParams>) => {
    setFilterState(prev => ({
      ...prev,
      ...newFilter
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography color="error">Error loading data: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* <FilterChipList onFilterChange={handleFilterChange} activeFilters={filterState} /> */}
      
      {data && (
        <Box sx={{ padding: 2 }}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Performance" />
                <CardContent>
                  <Box sx={{ '& > *': { marginBottom: 3 } }}>
                    <LineGraph 
                      data={data.tp} 
                      title={tpTitle}
                      line={tpGraph}
                      metrics={tpGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data[aogString]} 
                      title={aogTitle}
                      line={aogGraph}
                      metrics={aogGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data[prString]} 
                      title={prdTitle}
                      line={prdGraph}
                      metrics={prdGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data[qsString]} 
                      title={qsdTitle}
                      line={qsdGraph}
                      metrics={qsdGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data[sfString]} 
                      title={sfdTitle}
                      line={sfGraph}
                      metrics={sfdGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.sfo} 
                      title={sfoTitle}
                      line={sfGraph}
                      metrics={sfoGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.tti} 
                      title={ttiTitle}
                      line={ttiGraph}
                      metrics={ttiGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.pti} 
                      title={ptiTitle}
                      line={ptiGraph}
                      metrics={ptiGraphMetrics}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid size={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Volumes and Equipment" />
                <CardContent>
                  <Box sx={{ '& > *': { marginBottom: 3 } }}>
                    <LineGraph 
                      data={data[vpString]} 
                      title={dtvTitle}
                      line={dtvGraph}
                      metrics={dtvGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.vphpa} 
                      title={amvTitle}
                      line={amvGraph}
                      metrics={amvGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.vphpp} 
                      title={pmvTitle}
                      line={pmvGraph}
                      metrics={pmvGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data[papString]} 
                      title={paTitle}
                      line={paGraph}
                      metrics={paGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.du} 
                      title={duTitle}
                      line={duGraph}
                      metrics={duGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.pau} 
                      title={pauTitle}
                      line={pauGraph}
                      metrics={pauGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.cctv} 
                      title={cctvTitle}
                      line={cctvGraph}
                      metrics={cctvGraphMetrics}
                    />
                    
                    <LineGraph 
                      data={data.cu} 
                      title={cuTitle}
                      line={cuGraph}
                      metrics={cuGraphMetrics}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default SummaryTrend;
