"use client";

import React from 'react';
import Image from 'next/image';
import styles from './ProfileImage.module.css';

const ProfileImage = ({ src, alt, width = 50, height = 50, className }) => {
  // Default fallback image
  const fallbackSrc = '/noavatar.png';
  
  // Handle error if the image fails to load
  const [imgSrc, setImgSrc] = React.useState(src || fallbackSrc);
  
  return (
    <div className={`${styles.profileImageContainer} ${className || ''}`}>
      <Image
        src={imgSrc}
        alt={alt || "Profile"}
        width={width}
        height={height}
        className={styles.profileImage}
        onError={() => setImgSrc(fallbackSrc)}
        priority={false}
        quality={80}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default ProfileImage;