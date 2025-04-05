"use client"

import React from 'react';
import styles from "@/app/ui/dashboard/transactions/singleTransactions/singleTransactions.module.css";
import { addAnnouncements } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

const AddAnnouncementPage = () => {
  const router = useRouter();
  
  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    
    // Submit the form
    await addAnnouncements(formData);
    
    // Redirect back to announcements list
    router.push('/dashboard/announcement');
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <div>
              <label>Created By</label>
              <input type="text" name="createdBy" placeholder="Enter creator name" required />
            </div>
            <div>
              <label>Title</label>
              <input type="text" name="title" placeholder="Enter announcement title" required />
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <label>Description</label>
              <textarea 
                name="desc" 
                placeholder="Enter announcement description" 
                required 
                style={{ 
                  width: "100%", 
                  minHeight: "150px", 
                  backgroundColor: "var(--bgSoft)",
                  border: "2px solid white",
                  borderRadius: "5px",
                  padding: "10px",
                  color: "white",
                  resize: "vertical"
                }}
              ></textarea>
            </div>
          </div>
          <button type="submit">Create Announcement</button>
        </div>
      </form>
    </div>
  );
};

export default AddAnnouncementPage;
