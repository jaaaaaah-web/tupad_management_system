"use client";
import React from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle, MdRefresh } from 'react-icons/md';
import Link from 'next/link';

const Card3 = () => {
  const [count, setCount] = React.useState(0);
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

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      safeSetState(() => setLoading(true));
      const timestamp = Date.now();
      const response = await fetch(`/api/dashboard/beneficiary-count?t=${timestamp}`, { 
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch beneficiary count');
      }
      
      const data = await response.json();
      
      // Only update state if component is still mounted
      safeSetState(() => {
        setCount(data.count || 0);
        setLastUpdated(new Date());
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      safeSetState(() => setLoading(false));
    }
  }, []);

  // Setup effect for initial fetch and interval
  React.useEffect(() => {
    // Set the mounted flag to true
    isMounted.current = true;
    
    // Initial fetch
    fetchData();
    
    // Setup interval
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    
    // Cleanup function
    return () => {
      // Set mounted flag to false when component unmounts
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  // Simple click handler for refresh button
  const handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();
    fetchData();
  };
  
  return (
    <Link href="/dashboard/transaction" style={{ textDecoration: 'none', color: 'inherit' }}>
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
            <span className={styles.title}>Transactions</span>
            <span className={styles.number}>{loading ? '...' : count}</span>
            <span className={styles.detail}>
              Recent Transactions
            </span>
            {lastUpdated && (
              <span className={styles.lastUpdated}>
                <MdRefresh size={12} /> {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card3;