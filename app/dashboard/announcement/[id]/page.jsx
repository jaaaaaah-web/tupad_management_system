import React from 'react'
import { notifyAnnouncement } from "@/app/lib/actions";
import { fetchAnnoucementById } from "@/app/lib/data";
import styles from "@/app/ui/dashboard/announcement/announcementView.module.css";

export default async function AnnouncementViewPage({ params }) {
  const { id } = params;
  const announcement = await fetchAnnoucementById(id);
  
  if (!announcement) {
    return <div className={styles.error}>Announcement not found</div>;
  }
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{announcement.title}</h1>
      <div className={styles.meta}>
        <span>Created by: {announcement.createdBy}</span>
        <span>Date: {new Date(announcement.createdAt).toLocaleDateString()}</span>
      </div>
      
      <div className={styles.content}>
        {announcement.desc}
      </div>
      
      <div className={styles.actions}>
        <form action={notifyAnnouncement}>
          <input type="hidden" name="id" value={announcement._id} />
          <button type="submit" className={styles.notifyButton}>
            Notify All Beneficiaries
          </button>
        </form>
      </div>
    </div>
  );
}