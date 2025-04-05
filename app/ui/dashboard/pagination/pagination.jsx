"use client"
import React from 'react';
import styles from './pagination.module.css'
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Pagination = ({count}) => {
  const searchParams = useSearchParams();
  const router = useRouter(); 
  const pathname = usePathname();

  const page = searchParams.get("page") || 1;
  // Get rowCount from URL params or use default of "all"
  const rowCount = searchParams.get("rowCount") || "all";

  const params = new URLSearchParams(searchParams);
  
  // If rowCount is "all", pagination is not needed
  if (rowCount === "all") {
    return null; // Don't render pagination when showing all rows
  }
  
  const ITEM_PER_PAGE = parseInt(rowCount);

  const hasPrev = ITEM_PER_PAGE * (parseInt(page) - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (parseInt(page) - 1) + ITEM_PER_PAGE < count;

  const handleChangePage = (type) => {
    type === "prev" ? params.set("page", parseInt(page) - 1) : params.set("page", parseInt(page) + 1);
    router.replace(`${pathname}?${params}`);
  }
  
  return (
    <div className={styles.container}>
      <button className={styles.button} disabled={!hasPrev} onClick={()=>handleChangePage("prev")}>Previous</button>
      <button className={styles.button} disabled={!hasNext} onClick={()=>handleChangePage("next")}>Next</button>
    </div> 
  )
}
export default Pagination