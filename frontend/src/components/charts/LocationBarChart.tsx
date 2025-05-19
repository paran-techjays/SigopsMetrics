import React from 'react';
import Plot from 'react-plotly.js';

interface LocationBarChartProps {
  data: any;
  selectedMetric: string;
  height?: number;
  width?: string | number;
}

const LocationBarChart: React.FC<LocationBarChartProps> = ({
  data,
  selectedMetric,
  height = 450,
  width = "100%"
}) => {
  const getAxisTitle = () => {
    switch (selectedMetric) {
      case "throughput":
        return "Throughput (vph)";
      case "arrivalsOnGreen":
        return "Arrivals on Green";
      default:
        return "Value";
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

  return (
    <Plot
      data={[data]}
      layout={{
        autosize: true,
        height,
        margin: { l: 150, r: 10, t: 10, b: 50 },
        yaxis: {
          title: "",
          automargin: true,
          tickfont: { size: 10 },
        },
        xaxis: {
          title: getAxisTitle(),
          dtick: getDtick(),
          tickformat: getTickFormat(),
          range: getRange(),
          autorange: getAutorange(),
        },
      }}
      style={{ width, height: "100%" }}
    />
  );
};

export default LocationBarChart; 