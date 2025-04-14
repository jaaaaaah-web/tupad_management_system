"use client";
import React, { useState, useEffect } from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle, MdRefresh } from 'react-icons/md';
import Link from 'next/link';

const Card = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch beneficiary count
  const fetchBeneficiaryCount = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/beneficiary-count', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setCount(data.count);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch beneficiary count');
      }
    } catch (error) {
      console.error('Error fetching beneficiary count:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and setup polling
  useEffect(() => {
    // Fetch data immediately
    fetchBeneficiaryCount();
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchBeneficiaryCount();
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
            <span className={styles.number}>{count}</span>
            <span className={styles.detail}>
              All time
            </span>
            {lastUpdated && (
              <span className={styles.lastUpdated}>
                <MdRefresh size={12} /> Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;