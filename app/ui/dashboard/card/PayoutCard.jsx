"use client";
import React from 'react';
import styles from './card.module.css';
import { MdAttachMoney, MdRefresh } from 'react-icons/md';

const PayoutCard = ({ totalAmount, years, onYearChange, selectedYear, lastUpdated }) => {
  // Format the amount as currency
  const formattedAmount = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalAmount);
  
  // Get current year for default selection
  const currentYear = new Date().getFullYear();
  
  return (
    <div className={styles.container}>
      <div className={styles.yearFilterContainer}>
        <select 
          className={styles.yearFilter}
          value={selectedYear || currentYear}
          onChange={(e) => onYearChange(e.target.value)}
        >
          <option value="all">All Years</option>
          {years.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.cardContent}>
        <MdAttachMoney size={24} />
        <div className={styles.text}>
          <span className={styles.title}>Total Payouts</span>
          <span className={styles.number}>{formattedAmount}</span>
          <span className={styles.detail}>
            {selectedYear && selectedYear !== 'all' ? `For year ${selectedYear}` : 'All time'}
          </span>
          {lastUpdated && (
            <span className={styles.lastUpdated}>
              <MdRefresh size={12} /> Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PayoutCard;