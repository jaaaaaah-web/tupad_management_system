import React from 'react';
import { fetchTransaction } from "@/app/lib/data";
import TransactionPageClient from './TransactionPageClient';
import { unstable_noStore as noStore } from 'next/cache';

const TransactionPage = async ({ searchParams }) => {
  // Disable cache for this page
  noStore();
  
  const q = searchParams?.q || ""; 
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || "";
  const direction = searchParams?.direction || "asc";
  const rowCount = searchParams?.rowCount || "all";
  
  // Add a timestamp param to ensure we always get fresh data
  const timestamp = Date.now();
  
  const { count, transactions } = await fetchTransaction(q, page, sort, direction, rowCount);
      
  return <TransactionPageClient transactions={transactions} count={count} />;
}

export default TransactionPage;
