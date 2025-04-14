"use client";
import React from 'react';
import styles from './rightbar.module.css';
import { MdPeopleAlt, MdMap, MdRefresh } from 'react-icons/md';
import { useRealtimeData, formatLastUpdated } from '@/app/lib/realtimeFetch';

const Rightbar = () => {
  // Replace the manual polling with the new hook
  const { 
    data: chartData, 
    loading, 
    lastUpdated, 
    refetch: handleRefresh 
  } = useRealtimeData('/api/chart-data', {}, 18000); // 18 seconds polling interval
  
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