"use client";
import React, { useState, useEffect } from 'react';
import styles from "../ui/dashboard/dashboard.module.css";
import PayoutCard from '../ui/dashboard/card/PayoutCard';
import { fetchRealtimeData, setupPolling, formatLastUpdated } from '../lib/realtimeFetch';

const DashboardClient = ({ initialPayoutAmount, availableYears, children }) => {
  const [selectedYear, setSelectedYear] = useState(() => {
    // Default to current year if available, otherwise "all"
    const currentYear = new Date().getFullYear().toString();
    return availableYears.includes(currentYear) ? currentYear : "all";
  });
  
  const [totalPayoutAmount, setTotalPayoutAmount] = useState(initialPayoutAmount);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Function to fetch payout amount data with robust cache-busting
  const fetchPayoutAmount = async () => {
    try {
      const data = await fetchRealtimeData(`/api/dashboard/payout-amount?year=${selectedYear}`);
      setTotalPayoutAmount(data.amount);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching payout amount:', error);
    }
  };
  
  const handleYearChange = async (year) => {
    setSelectedYear(year);
    try {
      const data = await fetchRealtimeData(`/api/dashboard/payout-amount?year=${year}`);
      setTotalPayoutAmount(data.amount);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching payout amount for year change:', error);
    }
  };
  
  // Set up a polling interval to refresh data
  useEffect(() => {
    // Setup polling for payout amount - run every 15 seconds
    const cleanup = setupPolling(fetchPayoutAmount, 15000);
    
    // Clean up interval on component unmount or when selected year changes
    return cleanup;
  }, [selectedYear]);
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.card}>
          {/* The first child is the beneficiaries card */}
          {children[0]}
          <PayoutCard 
            totalAmount={totalPayoutAmount} 
            years={availableYears} 
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            lastUpdated={lastUpdated}
          />
        </div>
        {/* The rest of the children components (Transactions, Chart, etc.) */}
        {children.slice(1)}
      </div>
      <div className={styles.side}>
        {/* The last child is the Rightbar component */}
        {children[children.length - 1]}
      </div>
    </div>
  );
}

export default DashboardClient;