"use client";
import React, { useState, useEffect } from 'react';
import styles from "./transactions.module.css";
import Link from "next/link";
import { MdRefresh } from "react-icons/md";
import { fetchRealtimeData, setupPolling, formatLastUpdated } from '@/app/lib/realtimeFetch';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch latest transactions with robust cache-busting
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchRealtimeData('/api/dashboard/latest-transactions');
      setTransactions(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching latest transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling with our utility
  useEffect(() => {
    const cleanup = setupPolling(fetchTransactions, 12000); // 12 seconds for transactions
    return cleanup;
  }, []);

  // Function to refresh data manually
  const handleRefresh = () => {
    fetchTransactions();
  };

  // Get only the first 3 transactions
  const latestTransactions = transactions.slice(0, 3);
  
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
      
      {loading && transactions.length === 0 ? (
        <div className={styles.loading}>Loading transactions...</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <td>Created By</td>
              <td>Beneficiary</td>
              <td>Status</td>
              <td>Date</td>
              <td>Amount</td>
            </tr>
          </thead>
          <tbody>
            {latestTransactions.length > 0 ? (
              latestTransactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.cb}</td>
                  <td>{transaction.beneficiaries}</td>
                  <td>
                    <span className={`${styles.status} ${styles[transaction.status?.toLowerCase() || 'pending']}`}>
                      {transaction.status || 'Pending'}
                    </span>
                  </td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td>₱{transaction.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{textAlign: 'center'}}>No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <Link href="/dashboard/transaction">
        <span className={styles.viewAll}>View All</span>
      </Link>
    </div>
  );
};

export default Transactions;