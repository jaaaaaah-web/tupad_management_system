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
    
    // Handle data URLs from Vercel environment
    if (imageSrc.startsWith('dataurl:')) {
      // Extract the data URL part after the prefix and filename
      const parts = imageSrc.split(':');
      if (parts.length >= 3) {
        // The format is "dataurl:filename:actualDataUrl"
        // Join back all parts after the second colon in case the data URL itself contains colons
        return parts.slice(2).join(':');
      }
      return fallbackSrc;
    }
    
    // Add a cache-busting timestamp
    const timestamp = Date.now();
    
    // If it's already a full URL (including https:// or http://)
    if (imageSrc.startsWith('http')) {
      return `${imageSrc}${imageSrc.includes('?') ? '&' : '?'}t=${timestamp}`;
    }
    
    // If it's a blob URL (from camera capture)
    if (imageSrc.startsWith('blob:')) {
      return imageSrc; // Blob URLs don't need modification
    }
    
    // If it's a data URL (base64 encoded image)
    if (imageSrc.startsWith('data:')) {
      return imageSrc; // Data URLs don't need modification
    }
    
    // If it's a path starting with /uploads/ already
    if (imageSrc.startsWith('/uploads/')) {
      return `${imageSrc}${imageSrc.includes('?') ? '&' : '?'}t=${timestamp}`;
    }
    
    // If it's just a filename (with extension)
    if (imageSrc.match(/\.(jpeg|jpg|png|gif|webp)$/i) || !imageSrc.includes('/')) {
      return `/uploads/${imageSrc}${imageSrc.includes('?') ? '&' : '?'}t=${timestamp}`;
    }
    
    // For any other path
    return `${imageSrc}${imageSrc.includes('?') ? '&' : '?'}t=${timestamp}`;
  };
  
  // Set initial image source
  const [imgSrc, setImgSrc] = useState(() => processImageSrc(src));
  const [hasError, setHasError] = useState(false);
  
  // Update image source when props change
  useEffect(() => {
    if (src) {
      setImgSrc(processImageSrc(src));
      setHasError(false);
    }
  }, [src]);
  
  // Handle image loading error
  const handleImageError = () => {
    console.log("Image failed to load:", imgSrc);
    setHasError(true);
    setImgSrc(fallbackSrc);
  };
  
  return (
    <div className={`${styles.profileImageContainer} ${className || ''}`} style={{ width, height }}>
      <Image
        src={hasError ? fallbackSrc : imgSrc}
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