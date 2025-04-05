"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ProfileImage.module.css';

const ProfileImage = ({ src, alt, width = 50, height = 50, className }) => {
  // Default fallback image
  const fallbackSrc = '/noavatar.png';
  
  // Process the image source to handle different formats and cache busting
  const processImageSrc = (imageSrc) => {
    if (!imageSrc) return fallbackSrc;
    
    // If it's already a full URL or a properly formatted path with cache control, use it as is
    if (imageSrc.startsWith('http') || (imageSrc.startsWith('/') && imageSrc.includes('?t='))) {
      return imageSrc;
    }
    
    // If it's a path without cache control, add it
    if (imageSrc.startsWith('/')) {
      return `${imageSrc}${imageSrc.includes('?') ? '&' : '?'}t=${Date.now()}`;
    }
    
    // Otherwise, assume it's a filename and construct the path to uploads folder with cache busting
    return `/uploads/${imageSrc}?t=${Date.now()}`;
  };
  
  // Set initial image source
  const [imgSrc, setImgSrc] = useState(processImageSrc(src));
  
  // Update image source when props change
  useEffect(() => {
    setImgSrc(processImageSrc(src));
  }, [src]);
  
  // Handle image loading error
  const handleImageError = () => {
    console.log("Image failed to load:", imgSrc);
    setImgSrc(fallbackSrc);
  };
  
  return (
    <div className={`${styles.profileImageContainer} ${className || ''}`}>
      <Image
        src={imgSrc}
        alt={alt || "Profile"}
        width={width}
        height={height}
        className={styles.profileImage}
        onError={handleImageError}
        priority={false}
        unoptimized={true} /* Skip Next.js image optimization for dynamic images */
        quality={80}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default ProfileImage;