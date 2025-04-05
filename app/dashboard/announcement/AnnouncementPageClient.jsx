"use client";
import React from 'react';
import styles from "@/app/ui/dashboard/announcement/announcement.module.css";
import Search from "@/app/ui/dashboard/search/search";
import Link from 'next/link';
import Pagination from '@/app/ui/dashboard/pagination/pagination';
import { deleteAnnouncements } from '@/app/lib/actions';
import TableControls from '@/app/components/TableControls/TableControls';

const AnnouncementPageClient = ({ announcements, count }) => {
  // Define sort options for announcements
  const sortOptions = [
    { value: 'createdBy', label: 'Created By' },
    { value: 'title', label: 'Title' },
    { value: 'desc', label: 'Description' },
    { value: 'createdAt', label: 'Created At' },
  ];
   
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for Announcements..."/>
        <Link href="/dashboard/announcement/add">
          <button className={styles.addbutton}>Create New Announcement</button>
        </Link>
      </div>
      
      <TableControls 
        sortOptions={sortOptions} 
        defaultSort="createdAt"
        defaultRowCount="all"
      />
      
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Row Number</td>
            <td>ID</td>
            <td>Created By</td>
            <td>Title</td>
            <td>Description</td>
            <td>Created At</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement, index) => (
            <tr key={announcement._id}>
              <td>{index + 1}</td>
              <td>{announcement._id}</td>
              <td>
                <div className={styles.announcement}>
                  {announcement.createdBy}
                </div>
              </td>
              <td>{announcement.title}</td>
              <td>{announcement.desc}</td>
              <td>{announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString() : "N/A"}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/dashboard/announcement/${announcement._id}`}>
                    <button className={`${styles.button} ${styles.view}`}>View</button>
                  </Link>
                  <form action={deleteAnnouncements}>
                    <input type="hidden" name="id" value={announcement._id} />
                    <button className={`${styles.button} ${styles.delete}`}>Delete</button>
                  </form>
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

export default AnnouncementPageClient;