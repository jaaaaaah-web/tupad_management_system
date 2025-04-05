import React from 'react';
import styles from "@/app/ui/dashboard/notifications/notifications.module.css";
import { connectToDB } from '@/app/lib/utils';
import { Notification } from '@/app/lib/models';

const fetchNotifications = async () => {
  try {
    await connectToDB();
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(100); // Get the last 100 notifications
      
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

const NotificationsPage = async () => {
  const notifications = await fetchNotifications();
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Notification History</h1>
      
      <div className={styles.grid}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification._id} className={styles.card}>
              <div className={styles.header}>
                <h3>{notification.title}</h3>
                <span className={styles.date}>
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              <p className={styles.recipient}>To: {notification.recipientName} ({notification.recipientPhone})</p>
              <div className={styles.message}>
                {notification.message}
              </div>
              <div className={styles.status}>
                Status: <span className={styles[notification.status]}>{notification.status}</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>No notifications sent yet</div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;