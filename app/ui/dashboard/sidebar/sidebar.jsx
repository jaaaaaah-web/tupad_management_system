"use client"

import React, { useEffect, useState } from 'react';
import styles from './sidebar.module.css';
import Image from 'next/image';
import {MdDashboard,MdSupervisedUserCircle,MdAnnouncement,MdAdminPanelSettings,MdLogout, MdBackpack} from "react-icons/md";
import MenuLink from './menuLink/menuLink';
import { logout } from "@/app/lib/actions";

const Sidebar = () => {
  const [adminName, setAdminName] = useState("");
  const [profileImage, setProfileImage] = useState("/noavatar.png");
  const [userRole, setUserRole] = useState(""); // Add state for user role
  const [menuItems, setMenuItems] = useState([]); // State for menu items

  // Fetch the admin's info when component mounts
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('/api/admin-info');
        if (response.ok) {
          const data = await response.json();
          setAdminName(data.name || data.fullName || data.username || "Admin");
          
          // Set profile image if available
          if (data.profileImage) {
            setProfileImage(data.profileImage);
          }
          
          // Set user role
          setUserRole(data.role || "data_encoder");
          
          // Create menu items based on role
          const baseMenuItems = [
            {
              title: "Dashboard",
              path: "/dashboard",
              icon: <MdDashboard/>
            },
            {
              title: "Beneficiaries",
              path: "/dashboard/users",
              icon: <MdSupervisedUserCircle/>
            },
            {
              title: "Payouts",
              path: "/dashboard/transaction",
              icon: <MdBackpack/>
            },
            {
              title: "Announcements",
              path: "/dashboard/announcement",
              icon: <MdAnnouncement/>
            }
          ];
          
          // Only add User Management for system_admin
          if (data.role === "system_admin") {
            baseMenuItems.push({
              title: "User Management",
              path: "/dashboard/admins",
              icon: <MdAdminPanelSettings />,
            });
          }
          
          // Set the menu items
          setMenuItems([{
            title: "Main Menu",
            list: baseMenuItems
          }]);
        }
      } catch (error) {
        console.error("Failed to fetch admin info:", error);
        
        // Set default menu items on error
        setMenuItems([{
          title: "Main Menu",
          list: [
            {
              title: "Dashboard",
              path: "/dashboard",
              icon: <MdDashboard/>
            },
            {
              title: "Beneficiaries",
              path: "/dashboard/users",
              icon: <MdSupervisedUserCircle/>
            },
            {
              title: "Payouts",
              path: "/dashboard/transaction",
              icon: <MdBackpack/>
            },
            {
              title: "Announcements",
              path: "/dashboard/announcement",
              icon: <MdAnnouncement/>
            }
          ]
        }]);
      }
    };

    fetchAdminInfo();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <div className={styles.userImageContainer}>
          <Image 
            src={profileImage} 
            alt={adminName}
            className={styles.userImage}
            width={40}
            height={40}
            priority
          />
        </div>
        <div className={styles.UserDetail}>
          <span className={styles.username}>{adminName}</span>
          <span className={styles.userTitle}>
            {userRole === "system_admin" ? "System Admin" : "Data Encoder"}
          </span>
        </div>
      </div>
      <ul className={styles.hayop}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title}/>
            ))}
          </li>
        ))}
      </ul>
      <form action={logout}>
        <button type="submit" className={styles.logout}>
          <MdLogout/>
          Logout
        </button>
      </form>
    </div>
  );
}

export default Sidebar;