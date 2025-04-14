"use client";
import React, { useState, useEffect } from 'react';
import styles from "../ui/dashboard/dashboard.module.css";
import PayoutCard from '../ui/dashboard/card/PayoutCard';

const DashboardClient = ({ initialPayoutAmount, availableYears, children }) => {
  const [selectedYear, setSelectedYear] = useState(() => {
    // Default to current year if available, otherwise "all"
    const currentYear = new Date().getFullYear().toString();
    return availableYears.includes(currentYear) ? currentYear : "all";
  });
  
  const [totalPayoutAmount, setTotalPayoutAmount] = useState(initialPayoutAmount);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Function to fetch payout amount data
  const fetchPayoutAmount = async (year) => {
    try {
      const res = await fetch(`/api/dashboard/payout-amount?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setTotalPayoutAmount(data.amount);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch payout amount');
      }
    } catch (error) {
      console.error('Error fetching payout amount:', error);
    }
  };
  
  const handleYearChange = async (year) => {
    setSelectedYear(year);
    fetchPayoutAmount(year);
  };
  
  // Set up a polling interval to refresh data
  useEffect(() => {
    // Initial data fetch (beyond the one from SSR)
    fetchPayoutAmount(selectedYear);
    
    // Set up polling interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchPayoutAmount(selectedYear);
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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