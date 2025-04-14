"use client";
import React, { useState, useEffect } from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle, MdRefresh } from 'react-icons/md';
import Link from 'next/link';
import { formatLastUpdated } from '@/app/lib/realtimeFetch';

const Card = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch beneficiary count directly without any caching
  const fetchBeneficiaryCount = async () => {
    try {
      setLoading(true);
      // Add timestamp to URL to prevent caching
      const timestamp = new Date().getTime() + Math.floor(Math.random() * 1000);
      const response = await fetch(`/api/dashboard/beneficiary-count?_=${timestamp}`, {
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
        throw new Error('Failed to fetch beneficiary count');
      }
      
      const data = await response.json();
      setCount(data.count || 0);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching beneficiary count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBeneficiaryCount();
  }, []);

  // Set up polling interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchBeneficiaryCount();
    }, 15000); // Poll every 15 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Handle manual refresh
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