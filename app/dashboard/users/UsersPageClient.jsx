"use client";
import React from 'react';
import styles from "@/app/ui/dashboard/users/users.module.css";
import Search from '@/app/ui/dashboard/search/search';
import Link from 'next/link';
import Pagination from '@/app/ui/dashboard/pagination/pagination';
import { deleteUser } from '@/app/lib/actions';
import TableControls from '@/app/components/TableControls/TableControls';

const UsersPageClient = ({ users, count }) => {
  // Define sort options for users
  const sortOptions = [
    { value: 'lastName', label: 'Last Name' },
    { value: 'purok', label: 'Purok' },
    { value: 'createdAt', label: 'Created At' },
  ];
  
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for beneficiaries..."/>
        <Link href="/dashboard/users/add">
          <button className={styles.addbutton}>Add New Beneficiaries </button>
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
            <td>CP Number</td>
            <td>Purok</td>
            <td>Date of Birth</td>
            <td>Profession</td>
            <td>Created At</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id.toString()}>
              <td>{user.rowNumber}</td>
              <td>{user.lastName}</td>
              <td>{user.firstName}</td>
              <td>{user.middleName || "—"}</td>
              <td>{user.extension || "—"}</td>
              <td>{user.cpNumber}</td>
              <td>{user.purok}</td>
              <td>{formatDate(user.birthday)}</td>
              <td>{user.profession}</td>
              <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/users/${user._id.toString()}`} >
                    <button className={`${styles.button} ${styles.view}`}>View</button>
                  </Link>
                 
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

export default UsersPageClient;