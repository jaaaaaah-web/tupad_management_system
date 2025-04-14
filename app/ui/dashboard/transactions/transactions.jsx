"use client";
import React from 'react';
import styles from "./transactions.module.css";
import Link from "next/link";
import { MdRefresh } from "react-icons/md";
import { useRealtimeData, formatLastUpdated } from '@/app/lib/realtimeFetch';

const Transactions = () => {
  // Replace manual polling with our new hook
  const { 
    data: transactions, 
    loading, 
    lastUpdated, 
    refetch: handleRefresh 
  } = useRealtimeData('/api/dashboard/latest-transactions', {}, 8000); // 8 seconds polling interval
  
  // Get only the first 3 transactions
  const latestTransactions = (transactions || []).slice(0, 3);
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Latest Payouts</h2>
        <div className={styles.controls}>
          <button onClick={handleRefresh} className={styles.refreshButton} title="Refresh data">
            <MdRefresh />
          </button>
          <div className={styles.lastUpdated}>
            Last updated: {formatLastUpdated(lastUpdated)}
          </div>
        </div>
      </div>
      
      {loading && latestTransactions.length === 0 ? (
        <div className={styles.loading}>Loading transactions...</div>
      ) : latestTransactions.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <td>Beneficiary</td>
              <td>Status</td>
              <td>Date</td>
              <td>Amount</td>
            </tr>
          </thead>
          <tbody>
            {latestTransactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>
                  <div className={styles.user}>
                    {transaction.beneficiaries}
                  </div>
                </td>
                <td>
                  <span className={`${styles.status} ${styles[transaction.status]}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>₱{transaction.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.noTransactions}>
          <p>No recent transactions found</p>
        </div>
      )}
      <Link href="/dashboard/transaction" className={styles.link}>
        View All
      </Link>
    </div>
  );
};

export default Transactions;