'use client';

import { useState, useEffect } from 'react';
import styles from "@/app/ui/dashboard/admins/admins.module.css";
import Link from "next/link";
import ProfileImage from "@/app/components/ProfileImage";

const AdminTableClient = ({ initialAdmins = [], initialCount = 0 }) => {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Client-side fetch for admins data if initial data is empty
  useEffect(() => {
    const fetchAdminsData = async () => {
      // Only fetch if we don't have initial data
      if (initialAdmins.length === 0) {
        setIsLoading(true);
        try {
          const response = await fetch('/api/admins');
          if (!response.ok) {
            throw new Error('Failed to fetch admins data');
          }
          const data = await response.json();
          setAdmins(data.admins || []);
        } catch (err) {
          console.error('Error fetching admins:', err);
          setError('Failed to load admin data. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAdminsData();
  }, [initialAdmins]);

  // Handle error state or loading state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
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
        {isLoading ? (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center' }}>
              <div>Loading admins data...</div>
            </td>
          </tr>
        ) : admins && admins.length > 0 ? (
          admins.map((admin) => (
            <tr key={admin.id || admin._id}>
              <td>
                <div className={styles.user}>
                  <ProfileImage
                    src={admin.profileImage}
                    alt={admin.username}
                    className={styles.userImage}
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
                    <form action="/api/admins/unlock" method="POST">
                      <input type="hidden" name="id" value={admin.id || admin._id} />
                      <button className={`${styles.button} ${styles.unlock}`}>
                        Unlock
                      </button>
                    </form>
                  )}
                  
                  <form action="/api/admins/delete" method="POST">
                    <input type="hidden" name="id" value={admin.id || admin._id} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center' }}>
              <div>
                <p>No admins found or unable to connect to database.</p>
                <p>Try refreshing the page or contact support if the issue persists.</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AdminTableClient;