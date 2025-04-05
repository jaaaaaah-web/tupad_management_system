import React from 'react';
import { Suspense } from 'react';
import Card from '../ui/dashboard/card/card';
import styles from "../ui/dashboard/dashboard.module.css";
import Rightbar from '../ui/dashboard/rightbar/rightbar';
import Transactions from '../ui/dashboard/transactions/transactions';
import Chart from '../ui/dashboard/chart/chart';
import DashboardClient from './DashboardClient';
import { fetchTotalPayoutAmount, fetchTransactionYears } from '@/app/lib/data';

// Loading components for Suspense
const CardLoading = () => <div className={styles.loadingCard}>Loading...</div>;
const TransactionsLoading = () => <div className={styles.loadingTransactions}>Loading transactions...</div>;

const Dashboard = async () => {
  // Fetch the initial total payout amount (all years)
  const initialPayoutAmount = await fetchTotalPayoutAmount();
  
  // Fetch the available years for filtering
  const availableYears = await fetchTransactionYears();
  
  return (
    <DashboardClient initialPayoutAmount={initialPayoutAmount} availableYears={availableYears}>
      <Suspense fallback={<CardLoading />}>
        <Card/>
      </Suspense>
      <Suspense fallback={<TransactionsLoading />}>
        <Transactions/>
      </Suspense>
      <Chart/>
      <Rightbar/>
    </DashboardClient>
  );
}

export default Dashboard;