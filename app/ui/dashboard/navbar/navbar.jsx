import React from 'react';
import styles from './navbar.module.css';
import { usePathname } from 'next/navigation';
import { MdNotifications, MdOutlineChat, MdPublic } from 'react-icons/md';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <div className={styles.title}> {pathname.split("/").pop()}</div>
      <div className={styles.menu}>
        
        <div className={styles.icons}>
        
        </div>
      </div>
    </div>
  );
};

export default Navbar;