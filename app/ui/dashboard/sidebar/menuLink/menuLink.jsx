"use client";
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';
import styles from '../menuLink/menuLink.module.css';
const MenuLink = ({item}) => {

  const pathname = usePathname();

  
  return (
    <Link href={item.path} className={`${styles.container} ${pathname === item.path && styles.active}`}>
      {item.icon}
      {item.title}
    </Link>
  );
}

export default MenuLink;