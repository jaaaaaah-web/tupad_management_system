"use client";
import React, { useState, useEffect } from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle, MdRefresh } from 'react-icons/md';
import Link from 'next/link';
import { fetchRealtimeData, setupPolling, formatLastUpdated } from '@/app/lib/realtimeFetch';

const Card = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch beneficiary count with robust cache-busting
  const fetchBeneficiaryCount = async () => {
    try {
      setLoading(true);
      const data = await fetchRealtimeData('/api/dashboard/beneficiary-count');
      setCount(data.count);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching beneficiary count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling with our utility
  useEffect(() => {
    const cleanup = setupPolling(fetchBeneficiaryCount, 15000);
    return cleanup;
  }, []);

  // Function to refresh data manually
  const handleRefresh = (e) => {
    e.preventDefault(); // Prevent navigation since this is inside a Link
    fetchBeneficiaryCount();
  };
  
  return (
    <Link href="/dashboard/users" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.container}>
        <div className={styles.yearFilterContainer}>
          <button 
            onClick={handleRefresh} 
            className={styles.refreshButton} 
            title="Refresh data"
          >
            <MdRefresh />
          </button>
        </div>
        <div className={styles.cardContent}>
          <MdSupervisedUserCircle size={24}/>
          <div className={styles.text}>
            <span className={styles.title}>Total Beneficiaries</span>
            <span className={styles.number}>{loading ? '...' : count}</span>
            <span className={styles.detail}>
              All time
            </span>
            {lastUpdated && (
              <span className={styles.lastUpdated}>
                <MdRefresh size={12} /> Last updated: {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;