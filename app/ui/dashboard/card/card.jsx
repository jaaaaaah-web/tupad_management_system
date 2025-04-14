"use client";
import React from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle, MdRefresh } from 'react-icons/md';
import Link from 'next/link';
import { useRealtimeData, formatLastUpdated } from '@/app/lib/realtimeFetch';

const Card = () => {
  // Use the new hook for real-time data fetching
  const { 
    data, 
    loading, 
    lastUpdated, 
    refetch: handleRefresh 
  } = useRealtimeData('/api/dashboard/beneficiary-count', {}, 15000);
  
  // Extract count from the response data
  const count = data?.count || 0;
  
  return (
    <Link href="/dashboard/users" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.container}>
        <div className={styles.yearFilterContainer}>
          <button 
            onClick={(e) => {
              e.preventDefault(); // Prevent navigation since this is inside a Link
              handleRefresh();
            }} 
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