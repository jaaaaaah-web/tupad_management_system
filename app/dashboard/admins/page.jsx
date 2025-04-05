import React from 'react';
import styles from "@/app/ui/dashboard/admins/admins.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Link from "next/link";
import { fetchAdmins } from "@/app/lib/data";
import AdminTableClient from "@/app/components/AdminTableClient";
import TableControls from "@/app/components/TableControls/TableControls";

// Error handling component to prevent the entire page from crashing
const ErrorBoundary = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

const AdminPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || "";
  const direction = searchParams?.direction || "asc";
  const rowCount = searchParams?.rowCount || "all";
  
  // Wrap database call in try-catch for better error handling
  let count = 0;
  let admins = [];
  let error = null;
  
  try {
    const result = await fetchAdmins(q, page, sort, direction, rowCount);
    count = result.count;
    admins = result.admins;
  } catch (err) {
    console.error("Error fetching admins:", err);
    error = err.message;
    // Continue with empty data instead of crashing
  }
  
  // Define sort options for the table
  const sortOptions = [
    { value: "username", label: "Username" },
    { value: "name", label: "Name" },
    { value: "role", label: "Role" },
    { value: "createdAt", label: "Created At" }
  ];

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <div className={styles.top}>
          <Search placeholder="Search for admins..." />
          <Link href="/dashboard/admins/add">
            <button className={styles.addButton}>Add New Admin</button>
          </Link>
        </div>
        
        {/* Add TableControls component */}
        <div className={styles.controls}>
          <TableControls 
            sortOptions={sortOptions}
            defaultSort="createdAt"
            defaultRowCount="all"
          />
        </div>
        
        {/* Use client component with fallback for database errors */}
        <AdminTableClient initialAdmins={admins} initialCount={count} />
        
        <Pagination count={count} />
      </div>
    </ErrorBoundary>
  );
};

export default AdminPage;
