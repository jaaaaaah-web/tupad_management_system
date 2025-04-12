"use client";
import React, { useState } from 'react';
import styles from './backup.module.css';
import { MdBackup, MdRestore, MdDownload, MdUpload } from 'react-icons/md';

const BackupPageClient = () => {
  const [uploadStatus, setUploadStatus] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Function to trigger backup creation
  const handleCreateBackup = async () => {
    try {
      const response = await fetch('/api/backup/create', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      const data = await response.json();
      
      // Create a download link for the backup data
      const fileName = `tupad_backup_${new Date().toISOString().split('T')[0]}.json`;
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success message
      setUploadStatus("Backup created successfully!");
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error('Error creating backup:', error);
      setUploadStatus("Error creating backup. Please try again.");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };
  
  // Handle file selection for restore
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Function to trigger restore from backup
  const handleRestore = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a backup file first.");
      setTimeout(() => setUploadStatus(""), 3000);
      return;
    }
    
    if (!restoreConfirm) {
      setRestoreConfirm(true);
      return;
    }
    
    setIsRestoring(true);
    
    try {
      const formData = new FormData();
      formData.append('backupFile', selectedFile);
      
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to restore from backup');
      }
      
      setUploadStatus("Restore completed successfully!");
      setRestoreConfirm(false);
      setSelectedFile(null);
      // Reset file input
      document.getElementById('backupFile').value = '';
    } catch (error) {
      console.error('Error restoring from backup:', error);
      setUploadStatus("Error restoring from backup. Please ensure your file is valid.");
    } finally {
      setIsRestoring(false);
      setTimeout(() => setUploadStatus(""), 5000);
    }
  };
  
  // Cancel restore confirmation
  const handleCancelRestore = () => {
    setRestoreConfirm(false);
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <h1 className={styles.title}>Backup & Restore</h1>
      </div>
      
      <div className={styles.grid}>
        {/* Backup Section */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MdBackup className={styles.icon} />
            <h2>Create Backup</h2>
          </div>
          <div className={styles.cardContent}>
            <p>Generate a backup of all database collections. The backup will be downloaded as a JSON file.</p>
            <button className={styles.bckup} onClick={handleCreateBackup}>
              <MdDownload className={styles.buttonIcon} />
              Create & Download Backup
            </button>
          </div>
        </div>
        
        {/* Restore Section */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MdRestore className={styles.icon} />
            <h2>Restore from Backup</h2>
          </div>
          <div className={styles.cardContent}>
            <p>Restore database from a previously created backup file.</p>
            <div className={styles.fileUpload}>
              <input
                type="file"
                id="backupFile"
                accept=".json"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <label htmlFor="backupFile" className={styles.fileLabel}>
                {selectedFile ? selectedFile.name : "Choose backup file"}
              </label>
            </div>
            
            {restoreConfirm ? (
              <div className={styles.confirmBox}>
                <p className={styles.warning}>
                  Warning: This will overwrite the current database. This action cannot be undone!
                </p>
                <div className={styles.buttonGroup}>
                  <button 
                    className={`${styles.actionButton} ${styles.dangerButton}`} 
                    onClick={handleRestore}
                    disabled={isRestoring}
                  >
                    {isRestoring ? "Restoring..." : "Confirm Restore"}
                  </button>
                  <button 
                    className={styles.cancelButton} 
                    onClick={handleCancelRestore}
                    disabled={isRestoring}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className={`${styles.actionButton} ${styles.warningButton}`} 
                onClick={handleRestore}
                disabled={!selectedFile}
              >
                <MdUpload className={styles.buttonIcon} />
                Restore from Backup
              </button>
            )}
          </div>
        </div>
      </div>
      
      {uploadStatus && (
        <div className={styles.statusMessage}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
};

export default BackupPageClient;