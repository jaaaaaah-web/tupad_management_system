"use client";
import React from "react";
import styles from "./chart.module.css";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { MdRefresh } from "react-icons/md";

// Color palette for different age groups
const ageColors = {
  "18-25": "#8884d8", // Purple
  "26-35": "#82ca9d", // Green
  "36-45": "#ffc658", // Yellow
  "46-55": "#ff8042", // Orange
  "56+": "#0088fe"    // Blue
};

const Chart = () => {
  const [data, setData] = React.useState([]);
  const [ageGroups, setAgeGroups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  
  // Use ref to track if component is mounted
  const isMounted = React.useRef(true);
  
  // Format date for display
  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Function to safely update state only if component is mounted
  const safeSetState = (callback) => {
    if (isMounted.current) {
      callback();
    }
  };

  // Fetch data function with safety checks
  const fetchData = React.useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      safeSetState(() => setLoading(true));
      const timestamp = Date.now();
      const response = await fetch(`/api/chart-data?t=${timestamp}`, { 
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      
      const chartData = await response.json();
      
      // Only update state if component is still mounted
      safeSetState(() => {
        setData(chartData.data || []);
        setAgeGroups(chartData.ageGroups || []);
        setLastUpdated(new Date());
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      safeSetState(() => setLoading(false));
    }
  }, []);

  // Setup effect for initial fetch and interval
  React.useEffect(() => {
    // Set the mounted flag to true
    isMounted.current = true;
    
    // Initial fetch
    fetchData();
    
    // Setup interval - less frequent polling for the chart
    const interval = setInterval(() => {
      fetchData();
    }, 20000);
    
    // Cleanup function
    return () => {
      // Set mounted flag to false when component unmounts
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  // Simple refresh handler
  const handleRefresh = () => {
    fetchData();
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      let totalBeneficiaries = 0;
      payload.forEach(item => {
        totalBeneficiaries += item.value;
      });
      
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipHeader}>{`Purok: ${label}`}</p>
          
          <div className={styles.tooltipDetails}>
            {payload.map((entry, index) => (
              <p key={`tooltip-detail-${index}`} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value} (${Math.round(entry.value / totalBeneficiaries * 100)}%)`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading && data.length === 0) {
    return <div className={styles.container}>Loading chart data...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.chartHeader}>
        <div>
          <h2 className={styles.title}>Age Distribution by Purok</h2>
          <div className={styles.chartDescription}>
            <p>Distribution of beneficiaries by age groups across different puroks</p>
          </div>
        </div>
        <div className={styles.chartControls}>
          <button onClick={handleRefresh} className={styles.refreshButton} title="Refresh data">
            <MdRefresh />
          </button>
          <div className={styles.lastUpdated}>
            Last updated: {formatLastUpdated(lastUpdated)}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <XAxis 
            dataKey="name" 
            stroke="#ffffff" 
            tick={{ fill: '#ffffff' }}
            label={{ 
              value: 'Purok', 
              position: 'insideBottom', 
              offset: -5,
              fill: '#ffffff'
            }}
          />
          <YAxis 
            stroke="#ffffff" 
            tick={{ fill: '#ffffff' }}
            label={{ 
              value: 'Number of Beneficiaries', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#ffffff'
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend 
            verticalAlign="top" 
            wrapperStyle={{ paddingBottom: 20 }}
            formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
          />
          {ageGroups.map((ageGroup) => (
            <Bar 
              key={`age-group-${ageGroup}`}
              dataKey={ageGroup} 
              name={`${ageGroup} years`}
              fill={ageColors[ageGroup] || `hsl(${ageGroups.indexOf(ageGroup) * 60}, 70%, 60%)`} 
              stackId={false}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
