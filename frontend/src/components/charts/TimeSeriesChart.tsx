import React from 'react';
import Plot from 'react-plotly.js';
import chartTitles from '../../constants/mapData';

interface TimeSeriesChartProps {
  data: any[];
  selectedMetric: string;
  height?: number;
  width?: string | number;
  showLegend?: boolean;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  selectedMetric,
  height = 450,
  width = "100%",
  showLegend = false
}) => {
  const getYAxisTitle = () => {
    switch (selectedMetric) {
      case "throughput":
        return "Vehicles per Hour Trend";
      case "arrivalsOnGreen":
        return "Weekly Trend";
      default:
        return "Trend";
    }
  };

  const getDtick = () => {
    switch (selectedMetric) {
      case "throughput": return 500;
      case "arrivalsOnGreen": return 0.2;
      case "progressionRatio": return 0.5;
      case "spillbackRatio": return 0.2;
      case "peakPeriodSplitFailures": return 0.1;
      case "offPeakSplitFailures": return 0.05;
      case "travelTimeIndex": return 0.2;
      case "planningTimeIndex": return 0.5;
      default: return undefined;
    }
  };

  const getTickFormat = () => {
    if (["arrivalsOnGreen", "spillbackRatio", "peakPeriodSplitFailures", "offPeakSplitFailures"].includes(selectedMetric)) {
      return '.1%';
    }
    return undefined;
  };

  const getRange = () => {
    if (selectedMetric === "travelTimeIndex") {
      return [1, 2.2];
    } else if (selectedMetric === "planningTimeIndex") {
      return [1, 3];
    }
    return undefined;
  };

  const getAutorange = () => {
    return !["travelTimeIndex", "planningTimeIndex"].includes(selectedMetric);
  };

  console.log('chartTitles', selectedMetric)
  return (
    <Plot
      data={data}
      layout={{
        autosize: true,
        height,
        margin: { l: 50, r: 10, t: 10, b: 50 },
        xaxis: { 
          title: {
            text: chartTitles[selectedMetric]["timeSeriesChartTitle"],
            standoff: 40,
          },
        },
        yaxis: {
          // title: getYAxisTitle(),
          dtick: getDtick(),
          tickformat: getTickFormat(),
          range: getRange(),
          autorange: getAutorange(),
        },
        showlegend: showLegend,
        legend: { x: 0, y: 1 },
      }}
      style={{ width, height: "100%" }}
    />
  );
};

export default TimeSeriesChart; 