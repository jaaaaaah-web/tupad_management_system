"use client";
import React, { useState, useEffect } from 'react';
import styles from './rightbar.module.css';
import { MdPeopleAlt, MdMap, MdRefresh } from 'react-icons/md';
import { formatLastUpdated } from '@/app/lib/realtimeFetch';

const Rightbar = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch chart data directly without any hooks
  const fetchChartData = async () => {
    try {
      setLoading(true);
      // Add timestamp to URL to prevent caching
      const timestamp = new Date().getTime() + Math.floor(Math.random() * 1000);
      const response = await fetch(`/api/chart-data?_=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'x-vercel-cache-control-bypass': 'true'
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      
      const data = await response.json();
      setChartData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchChartData();
  }, []);

  // Set up polling interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchChartData();
    }, 18000); // Poll every 18 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchChartData();
  };
  
  // Process the data for display
  const purokData = React.useMemo(() => {
    if (!chartData || !chartData.data || !chartData.ageGroups) {
      return [];
    }
    
    // Calculate total for each purok using the age group data
    const processedData = chartData.data.map(purok => {
      const ageGroups = chartData.ageGroups || [];
      let total = 0;
      ageGroups.forEach(group => {
        total += purok[group] || 0;
      });
      return {
        name: purok.name,
        total: total
      };
    });
    
    // Sort by total beneficiaries descending
    return processedData.sort((a, b) => b.total - a.total);
  }, [chartData]);

  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <MdPeopleAlt className={styles.icon} />
            <h3 className={styles.title}>Beneficiaries by Purok</h3>
          </div>
          <button onClick={handleRefresh} className={styles.refreshButton} title="Refresh data">
            <MdRefresh />
          </button>
        </div>

        <div className={styles.lastUpdated}>
          Last updated: {formatLastUpdated(lastUpdated)}
        </div>

        {loading && purokData.length === 0 ? (
          <div className={styles.loading}>Loading data...</div>
        ) : (
          <div className={styles.purokList}>
            {purokData.map((purok, index) => (
              <div key={purok.name} className={styles.purokItem}>
                <div className={styles.purokInfo}>
                  <MdMap className={styles.purokIcon} />
                  <span className={styles.purokName}>{purok.name}</span>
                </div>
                <div className={styles.purokCount}>
                  <span className={styles.count}>{purok.total}</span>
                  <div className={styles.rankBadge} style={{ backgroundColor: index < 3 ? 'var(--green)' : 'var(--softBg)' }}>
                    #{index + 1}
                  </div>
                </div>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBar} 
                    style={{ 
                      width: `${purokData[0]?.total ? (purok.total / purokData[0].total * 100) : 0}%`,
                      backgroundColor: index < 3 ? 'var(--green)' : 'var(--textSoft)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Rightbar;