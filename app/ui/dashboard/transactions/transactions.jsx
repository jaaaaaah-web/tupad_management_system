"use client";
import React, { useState, useEffect } from 'react';
import styles from "./transactions.module.css";
import Link from "next/link";
import { MdRefresh } from "react-icons/md";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Function to fetch latest transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/latest-transactions', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
        setLastUpdated(new Date());
      } else {
        console.error('Failed to fetch latest transactions');
      }
    } catch (error) {
      console.error('Error fetching latest transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and setup polling
  useEffect(() => {
    // Fetch data immediately
    fetchTransactions();
    
    // Set up polling interval (every 35 seconds)
    const intervalId = setInterval(() => {
      fetchTransactions();
    }, 35000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
            Last updated: {lastUpdated.toLocaleTimeString()}
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