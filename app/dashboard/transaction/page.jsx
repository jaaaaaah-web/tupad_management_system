import React from 'react';
import { fetchTransaction } from "@/app/lib/data";
import TransactionPageClient from './TransactionPageClient';

const TransactionPage = async ({ searchParams }) => {
  const q = searchParams?.q || ""; 
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || "";
  const direction = searchParams?.direction || "asc";
  const rowCount = searchParams?.rowCount || "all";
  
  const { count, transactions } = await fetchTransaction(q, page, sort, direction, rowCount);
      
  return <TransactionPageClient transactions={transactions} count={count} />;
}

export default TransactionPage;
