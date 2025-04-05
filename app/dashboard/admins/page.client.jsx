'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from "@/app/ui/dashboard/admins/admins.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Link from "next/link";
import ProfileImage from "@/app/components/ProfileImage";
import TableControls from "@/app/components/TableControls/TableControls";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const AdminsClientPage = () => {
  const [admins, setAdmins] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get search parameters
  const q = searchParams.get('q') || '';
  const page = searchParams.get('page') || 1;
  const sort = searchParams.get('sort') || 'createdAt';
  const direction = searchParams.get('direction') || 'desc';
  const rowCount = searchParams.get('rowCount') || '10';

  // Define sort options for the table
  const sortOptions = [
    { value: "username", label: "Username" },
    { value: "name", label: "Name" },
    { value: "role", label: "Role" },
    { value: "createdAt", label: "Created At" }
  ];

  // Create a function to update search params and navigate
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  // Handle search submission
  const handleSearch = (searchTerm) => {
    // Reset to page 1 when searching
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('q', searchTerm);
    newParams.set('page', '1');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Check if we need to redirect to login
  const handleAuthError = useCallback((status) => {
    if (status === 401) {
      // Redirect to login page if unauthorized
      router.push('/login?redirect=' + encodeURIComponent(pathname + '?' + searchParams.toString()));
      return true;
    }
    return false;
  }, [router, pathname, searchParams]);

  // Fetch admins data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build query string
        const queryParams = new URLSearchParams();
        if (q) queryParams.set('q', q);
        if (page) queryParams.set('page', page);
        if (sort) queryParams.set('sort', sort);
        if (direction) queryParams.set('direction', direction);
        if (rowCount) queryParams.set('rowCount', rowCount);
        
        // Use the API endpoint with proper query parameters
        const res = await fetch(`/api/admins?${queryParams.toString()}&timestamp=${new Date().getTime()}`, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        // Check if we got an unauthorized response
        if (res.status === 401) {
          if (handleAuthError(401)) return;
        }
        
        // Get the response data
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch admin data');
        }
        
        setAdmins(data.admins || []);
        setCount(data.count || 0);
        setError(null);
        setErrorDetails(null);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setError('Failed to load admin data. Please try refreshing the page.');
        setErrorDetails(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [q, page, sort, direction, rowCount, retryCount, handleAuthError]);

  // Handle admin deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const formData = new FormData();
        formData.append('id', id);
        
        const res = await fetch('/api/admins/delete', {
          method: 'POST',
          body: formData,
        });
        
        // Check if unauthorized
        if (res.status === 401) {
          if (handleAuthError(401)) return;
        }
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to delete admin');
        }
        
        // Refresh the data by incrementing retry count to trigger a refetch
        setRetryCount(prev => prev + 1);
      } catch (err) {
        console.error('Error deleting admin:', err);
        alert('Failed to delete admin. Please try again.');
      }
    }
  };

  // Handle account unlocking
  const handleUnlock = async (id) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      
      const res = await fetch('/api/admins/unlock', {
        method: 'POST',
        body: formData,
      });
      
      // Check if unauthorized
      if (res.status === 401) {
        if (handleAuthError(401)) return;
      }
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to unlock admin account');
      }
      
      // Refresh data instead of just updating local state
      setRetryCount(prev => prev + 1);
    } catch (err) {
      console.error('Error unlocking admin account:', err);
      alert('Failed to unlock admin account. Please try again.');
    }
  };

  // Add a method to retry fetching data
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Login redirect handler
  const handleLoginRedirect = () => {
    router.push('/login?redirect=' + encodeURIComponent(pathname + '?' + searchParams.toString()));
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer || styles.error}>
          <h3>Error Loading Admin Data</h3>
          <p>{error}</p>
          {errorDetails && (
            <details>
              <summary>Technical Details</summary>
              <pre>{errorDetails}</pre>
            </details>
          )}
          <div className={styles.errorActions}>
            <button 
              className={styles.retryButton} 
              onClick={handleRetry}
            >
              Try Again
            </button>
            {errorDetails && errorDetails.includes('Unauthorized') && (
              <button 
                className={styles.loginButton} 
                onClick={handleLoginRedirect}
              >
                Log In
              </button>
            )}
            <button 
              className={styles.dashboardButton} 
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for admins..." onSearch={handleSearch} defaultValue={q} />
        <Link href="/dashboard/admins/add">
          <button className={styles.addButton}>Add New Admin</button>
        </Link>
      </div>
      
      {/* Add TableControls component */}
      <div className={styles.controls}>
        <TableControls 
          sortOptions={sortOptions}
          defaultSort={sort || "createdAt"}
          defaultDirection={direction || "desc"}
          defaultRowCount={rowCount || "10"}
        />
      </div>
      
      {loading ? (
        <div className={styles.loading}>
          <p>Loading admin data...</p>
          <div className={styles.loadingSpinner}></div>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <td>Image</td>
              <td>Username</td>
              <td>Email</td>
              <td>Name</td>
              <td>Role</td>
              <td>Status</td>
              <td>Created At</td>
              <td>Actions</td>
            </tr>
          </thead>
          <tbody>
            {admins && admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin.id || admin._id}>
                  <td>
                    <div className={styles.user}>
                      <ProfileImage
                        src={admin.profileImage}
                        alt={admin.username}
                        className={styles.userImageSmall}
                        width={40}
                        height={40}
                        key={`profile-${admin.id || admin._id}-${retryCount}`}
                      />
                    </div>
                  </td>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>{admin.name || "No name provided"}</td>
                  <td>{admin.role === 'system_admin' ? 'System Admin' : 'Data Encoder'}</td>
                  <td>
                    <span className={`${styles.status} ${admin.accountLocked ? styles.locked : styles.active}`}>
                      {admin.accountLocked ? 'Locked' : 'Active'}
                    </span>
                  </td>
                  <td>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <div className={styles.buttons}>
                      <Link href={`/dashboard/admins/${admin.id || admin._id}`}>
                        <button className={`${styles.button} ${styles.view}`}>
                          View
                        </button>
                      </Link>
                      
                      {admin.accountLocked && (
                        <button 
                          className={`${styles.button} ${styles.unlock}`}
                          onClick={() => handleUnlock(admin.id || admin._id)}
                        >
                          Unlock
                        </button>
                      )}
                      
                      <button 
                        className={`${styles.button} ${styles.delete}`}
                        onClick={() => handleDelete(admin.id || admin._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
                  <div>
                    <p>No admins found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      
      <Pagination count={count} />
    </div>
  );
};

export default AdminsClientPage;