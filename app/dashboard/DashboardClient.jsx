"use client";
import React, { useState } from 'react';
import styles from "../ui/dashboard/dashboard.module.css";
import PayoutCard from '../ui/dashboard/card/PayoutCard';

const DashboardClient = ({ initialPayoutAmount, availableYears, children }) => {
  const [selectedYear, setSelectedYear] = useState(() => {
    // Default to current year if available, otherwise "all"
    const currentYear = new Date().getFullYear().toString();
    return availableYears.includes(currentYear) ? currentYear : "all";
  });
  
  const [totalPayoutAmount, setTotalPayoutAmount] = useState(initialPayoutAmount);
  
  const handleYearChange = async (year) => {
    setSelectedYear(year);
    
    // Fetch new payout amount based on selected year
    try {
      const res = await fetch(`/api/dashboard/payout-amount?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setTotalPayoutAmount(data.amount);
      } else {
        console.error('Failed to fetch payout amount');
      }
    } catch (error) {
      console.error('Error fetching payout amount:', error);
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