"use client";
import styles from "./chart.module.css";
import { useEffect, useState } from "react";
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
  const [data, setData] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chart-data', {
        // Add cache-busting query parameter to prevent browser caching
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const chartData = await response.json();
        setData(chartData.data || []);
        setAgeGroups(chartData.ageGroups || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchChartData();
    
    // Set up polling interval (every 45 seconds)
    const intervalId = setInterval(() => {
      fetchChartData();
    }, 45000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    fetchChartData();
  };

  if (loading && data.length === 0) {
    return <div className={styles.container}>Loading chart data...</div>;
  }

  // Custom tooltip component that shows details for each age group
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
              <p key={index} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value} (${Math.round(entry.value / totalBeneficiaries * 100)}%)`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

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
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          {/* Removed CartesianGrid to eliminate the background grid lines */}
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
          {ageGroups.map((ageGroup, index) => (
            <Bar 
              key={ageGroup}
              dataKey={ageGroup} 
              name={`${ageGroup} years`}
              fill={ageColors[ageGroup] || `hsl(${index * 60}, 70%, 60%)`} 
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
