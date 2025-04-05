"use client";
import React, { useEffect, useState } from 'react';
import styles from './rightbar.module.css';
import { MdPeopleAlt, MdMap, MdRefresh } from 'react-icons/md';

const Rightbar = () => {
  const [purokData, setPurokData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch beneficiaries by purok
  const fetchBeneficiariesByPurok = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chart-data');
      if (response.ok) {
        const data = await response.json();
        // Calculate total for each purok using the age group data
        const processedData = data.data.map(purok => {
          const ageGroups = data.ageGroups || [];
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
        processedData.sort((a, b) => b.total - a.total);
        setPurokData(processedData);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch purok data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchBeneficiariesByPurok();
  }, []);

  // Function to refresh data
  const handleRefresh = () => {
    fetchBeneficiariesByPurok();
  };

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
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {loading ? (
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