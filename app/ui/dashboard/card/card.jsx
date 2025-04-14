"use client";
import React from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle, MdRefresh } from 'react-icons/md';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Card = () => {
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState(null);
  const intervalRef = React.useRef(null);
  const router = useRouter();

  // Format date for display
  const formatLastUpdated = (date) => {
    if (!date) return 'Never';
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    });
  };

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      // Add timestamp to URL to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/dashboard/beneficiary-count?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch beneficiary count');
      }
      
      const data = await response.json();
      setCount(data.count || 0);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle manual refresh
  const handleRefresh = (e) => {
    e.preventDefault(); // Prevent navigation since this is inside a Link
    fetchData();
    // Force router refresh to ensure data updates across components
    router.refresh();
  };

  // Set up initial fetch and polling
  React.useEffect(() => {
    // Fetch initial data
    fetchData();
    
    // Set up interval for polling
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 15000);
    
    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);
  
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