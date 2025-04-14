"use client";
import React, { useState, useEffect } from 'react';
import styles from "../ui/dashboard/dashboard.module.css";
import PayoutCard from '../ui/dashboard/card/PayoutCard';
import { fetchRealtimeData, formatLastUpdated, useRealtimeData } from '../lib/realtimeFetch';

const DashboardClient = ({ initialPayoutAmount, availableYears, children }) => {
  const [selectedYear, setSelectedYear] = useState(() => {
    // Default to current year if available, otherwise "all"
    const currentYear = new Date().getFullYear().toString();
    return availableYears.includes(currentYear) ? currentYear : "all";
  });
  
  // We'll use the realtimeData hook for fetching data
  // Notice we pass a dynamic URL based on the selected year
  const { 
    data: payoutData, 
    lastUpdated,
    refetch: refetchPayoutAmount
  } = useRealtimeData(`/api/dashboard/payout-amount?year=${selectedYear}`, {}, 15000);
  
  // We'll keep using the original state for the PayoutCard since it works in production
  const [totalPayoutAmount, setTotalPayoutAmount] = useState(initialPayoutAmount);
  
  // Update totalPayoutAmount whenever the payoutData changes
  useEffect(() => {
    if (payoutData && payoutData.amount !== undefined) {
      setTotalPayoutAmount(payoutData.amount);
    }
  }, [payoutData]);
  
  // Handler for year change, keeping the original implementation
  const handleYearChange = async (year) => {
    setSelectedYear(year);
    try {
      const data = await fetchRealtimeData(`/api/dashboard/payout-amount?year=${year}`);
      setTotalPayoutAmount(data.amount);
    } catch (error) {
      console.error('Error fetching payout amount for year change:', error);
    }
  };
  
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