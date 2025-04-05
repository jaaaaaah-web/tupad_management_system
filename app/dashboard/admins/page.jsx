import React from 'react';
import styles from "@/app/ui/dashboard/admins/admins.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Pagination from "@/app/ui/dashboard/pagination/pagination";
import Link from "next/link";
import { fetchAdmins } from "@/app/lib/data";
import { deleteAdmin, unlockAccount } from "@/app/lib/actions";
import ProfileImage from "@/app/components/ProfileImage";
import TableControls from "@/app/components/TableControls/TableControls";

const AdminPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  const sort = searchParams?.sort || "";
  const direction = searchParams?.direction || "asc";
  const rowCount = searchParams?.rowCount || "all";
  
  const { count, admins } = await fetchAdmins(q, page, sort, direction, rowCount);
  
  // Define sort options for the table
  const sortOptions = [
    { value: "username", label: "Username" },
    { value: "name", label: "Name" },
    { value: "role", label: "Role" },
    { value: "createdAt", label: "Created At" }
  ];

  return (
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
                      <form action={unlockAccount}>
                        <input type="hidden" name="id" value={admin.id || admin._id} />
                        <button className={`${styles.button} ${styles.unlock}`}>
                          Unlock
                        </button>
                      </form>
                    )}
                    
                    <form action={deleteAdmin}>
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
              <td colSpan={8} style={{ textAlign: 'center' }}>No admins found</td>
            </tr>
          )}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
};

export default AdminPage;
