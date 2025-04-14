import React from 'react';
import Card from '../ui/dashboard/card/card';
import styles from "../ui/dashboard/dashboard.module.css";
import Rightbar from '../ui/dashboard/rightbar/rightbar';
import Transactions from '../ui/dashboard/transactions/transactions';
import Chart from '../ui/dashboard/chart/chart';
import DashboardClient from './DashboardClient';
import { fetchTotalPayoutAmount, fetchTransactionYears } from '@/app/lib/data';

// No longer need Suspense wrappers since components handle their own loading states

const Dashboard = async () => {
  // Fetch the initial total payout amount (all years)
  const initialPayoutAmount = await fetchTotalPayoutAmount();
  
  // Fetch the available years for filtering
  const availableYears = await fetchTransactionYears();
  
  return (
    <DashboardClient initialPayoutAmount={initialPayoutAmount} availableYears={availableYears}>
      <Card/>
      <Transactions/>
      <Chart/>
      <Rightbar/>
    </DashboardClient>
  );
}

export default Dashboard;