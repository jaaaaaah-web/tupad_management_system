"use client";
import React from 'react';
import styles from "@/app/ui/dashboard/transactions/TransactionsPage/transactionspage.module.css";
import Search from '@/app/ui/dashboard/search/search';
import Link from "next/link";
import Pagination from '@/app/ui/dashboard/pagination/pagination';
import { deleteTransactions } from '@/app/lib/actions';
import TableControls from '@/app/components/TableControls/TableControls';

const TransactionPageClient = ({ transactions, count }) => {
  // Define sort options for transactions
  const sortOptions = [
    { value: 'lastName', label: 'Last Name' },
    { value: 'amount', label: 'Amount' },
    { value: 'createdAt', label: 'Date' },
  ];
      
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for transactions..." />
        <Link href="/dashboard/transaction/add">
          <button className={styles.addButton}>Create New Payout</button>
        </Link>
      </div>
      
      
      <TableControls 
        sortOptions={sortOptions} 
        defaultSort="lastName"
        defaultRowCount="all"
      />
      
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Row Number</td>
            <td>Last Name</td>
            <td>First Name</td>
            <td>Middle Name</td>
            <td>Extension</td>
            <td>Status</td>
            <td>Amount</td>
            <td>Created By</td>
            <td>Date Received</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
        {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.rowNumber}</td>
              <td>{transaction.lastName}</td>
              <td>{transaction.firstName}</td>
              <td>{transaction.middleName || "-"}</td>
              <td>{transaction.extension || "-"}</td>
              <td>
                <span className={`${styles.status} ${
                  transaction.status === "pending" 
                    ? styles.pending 
                    : transaction.status === "cancelled" 
                      ? styles.cancelled 
                      : transaction.status === "done" 
                        ? styles.done 
                        : ""
                }`}>
                  {transaction.status}
                </span>
              </td>
              <td>{transaction.amount}</td>
              <td>{transaction.cb || "-"}</td>
              <td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "-"}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/transaction/${transaction.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>View</button>
                  </Link>
                  <form action={deleteTransactions}>
                  <input type="hidden" name="id" value={transaction.id} />
                  <button className={`${styles.button} ${styles.delete}`}>Delete</button>
                  </form>
                </div>
              </td>
            </tr>
         ))}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
}

export default TransactionPageClient;