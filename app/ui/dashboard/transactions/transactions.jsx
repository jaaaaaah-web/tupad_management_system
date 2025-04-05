import React from 'react';
import styles from "./transactions.module.css";
import { fetchLatestTransactions } from "@/app/lib/data";
import Link from "next/link";

const Transactions = async () => {
  // Fetch the latest transactions
  const transactions = await fetchLatestTransactions();

  // Get only the first 3 transactions
  const latestTransactions = transactions.slice(0, 3);
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Latest Payouts</h2>
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
      <Link href="/dashboard/transaction">
        <span className={styles.viewAll}>View All</span>
      </Link>
    </div>
  );
};

export default Transactions;