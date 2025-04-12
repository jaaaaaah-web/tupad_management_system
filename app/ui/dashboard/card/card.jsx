import React from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle } from 'react-icons/md';
import { fetchBeneficiariesCount } from '@/app/lib/data';
import Link from 'next/link';

const Card = async () => {
  // Fetch real data from database
  const count = await fetchBeneficiariesCount();
  
  return (
    <Link href="/dashboard/users" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.container}>
        {/* Added empty div for size consistency with PayoutCard */}
        <div className={styles.yearFilterContainer}>
          <div className={styles.yearFilter} style={{ visibility: 'hidden' }}>
            All Years
          </div>
        </div>
        <div className={styles.cardContent}>
          <MdSupervisedUserCircle size={24}/>
          <div className={styles.text}>
            <span className={styles.title}>Total Beneficiaries</span>
            <span className={styles.number}>{count}</span>
            <span className={styles.detail}>
              All time
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;