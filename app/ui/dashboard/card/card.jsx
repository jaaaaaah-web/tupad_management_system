import React from 'react';
import styles from './card.module.css';
import { MdSupervisedUserCircle } from 'react-icons/md';
import { fetchBeneficiariesCount } from '@/app/lib/data';

const Card = async () => {
  // Fetch real data from database
  const count = await fetchBeneficiariesCount();
  
  return (
    <div className={styles.container}>
      <div className={styles.cardContent}>
        <MdSupervisedUserCircle size={24}/>
        <div className={styles.text}>
          <span className={styles.title}>Total Beneficiaries</span>
          <span className={styles.number}>{count}</span>
          <span className={styles.detail}>
            
          </span>
        </div>
      </div>
    </div>
  );
}

export default Card;