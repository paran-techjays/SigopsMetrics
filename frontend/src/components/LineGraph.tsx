import React from 'react';
import { Typography, Box } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Graph } from '../pages/graph';
import { Metrics } from '../pages/metrics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineGraphProps {
  data: any[];
  title: string;
  line: Graph;
  metrics: Metrics;
}

// Extend the dataset type for our custom properties
interface CustomDataset {
  label: string;
  data: number[];
  fill: boolean;
  borderColor: string;
  tension: number;
  pointRadius: number;
  pointHoverRadius: number;
  borderDash?: number[];
}

const LineGraph: React.FC<LineGraphProps> = ({ data, title, line, metrics }) => {
  if (!data || data.length === 0) {
    return <Typography>No data available</Typography>;
  }

  const formatData = (): ChartData<'line'> => {
    const labels = data.map((item) => {
      const date = new Date(item.month);
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    });

    const values = data.map((item) => item.average);

    const datasets: CustomDataset[] = [
      {
        label: title,
        data: values,
        fill: false,
        borderColor: line.lineColor || '#66cc66',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      }
    ];

    // Add goal line if goal is defined in metrics
    if (metrics.goal) {
      datasets.push({
        label: 'Goal',
        data: Array(data.length).fill(metrics.goal),
        fill: false,
        borderColor: '#ff0000',
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 0,
        borderDash: [5, 5]
      });
    }

    return {
      labels,
      datasets
    };
  };

  const formatYAxis = (value: number) => {
    if (metrics.formatType === 'percent') {
      return `${(value * 100).toFixed(metrics.formatDecimals)}%`;
    }
    return value.toFixed(metrics.formatDecimals);
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatYAxis(value as number);
          }
        },
        beginAtZero: false,
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (metrics.formatType === 'percent') {
              return label + ((context.parsed.y as number) * 100).toFixed(metrics.formatDecimals) + '%';
            }
            return label + (context.parsed.y as number).toFixed(metrics.formatDecimals);
          }
        }
      },
      legend: {
        display: false,
      }
    }
  };

  return (
    <Box sx={{ marginBottom: 3 }}>
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: 250 }}>
        <Line data={formatData()} options={options} />
      </Box>
    </Box>
  );
};

export default LineGraph; 