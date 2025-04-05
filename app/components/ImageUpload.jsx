"use client"

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './ImageUpload.module.css';
import { loadFaceDetectionModels, validateFaceImage } from '@/app/lib/faceDetection';

export default function ImageUpload({ onImageSelected, initialImage }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load face detection model
  useEffect(() => {
    const initializeFaceDetection = async () => {
      try {
        setValidationMessage('Loading face detection model...');
        await loadFaceDetectionModels();
        setModelLoaded(true);
        console.log("Face detection model loaded");
        setValidationMessage('');
      } catch (error) {
        console.error("Error loading face detection model:", error);
        setValidationMessage('Face detection unavailable. You can still upload an image, but face verification is disabled.');
      }
    };
    
    initializeFaceDetection();
    
    // Set initial image if provided
    if (initialImage) {
      // Add cache busting to initial image if it's a path and not a blob
      if (initialImage && !initialImage.startsWith('blob:')) {
        const timestamp = Date.now();
        // Add timestamp to image URL to prevent caching
        const imageWithTimestamp = initialImage.includes('?') 
          ? `${initialImage}&t=${timestamp}` 
          : `${initialImage}?t=${timestamp}`;
        setPreviewUrl(imageWithTimestamp);
      } else {
        setPreviewUrl(initialImage);
      }
      setIsValid(true); // Assume existing images are valid
    }
    
    // Cleanup on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      stopCamera();
    };
  }, [initialImage]);

  // Handle image upload
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      setValidationMessage('Please select an image file');
      setIsValid(false);
      onImageSelected(null);
      return;
    }
    
    // Reset state
    setIsValid(false);
    setIsProcessing(true);
    setValidationMessage('Analyzing image...');
    
    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    // If face detection model failed to load, accept the image but warn the user
    if (!modelLoaded) {
      setValidationMessage('Face detection is unavailable. Image accepted without verification.');
      setIsValid(true);
      onImageSelected(file);
      setIsProcessing(false);
      return;
    }
    
    try {
      // Validate face
      const result = await validateFaceImage(file);
      
      // Update state based on detection result
      setValidationMessage(result.message);
      setIsValid(result.valid);
      
      // If valid, pass the file to parent component
      if (result.valid) {
        onImageSelected(file);
        if (result.confidence) {
          setValidationMessage(`Valid human face detected with ${result.confidence}% confidence!`);
        }
      } else {
        onImageSelected(null);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      setValidationMessage('Error processing image. Try again or use a different photo.');
      setIsValid(false);
      onImageSelected(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (!showCamera) {
      fileInputRef.current?.click();
    }
  };

  // Initialize webcam
  const startCamera = async () => {
    try {
      setValidationMessage('Starting camera...');
      setShowCamera(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve);
          };
        });
        
        setCameraReady(true);
        setValidationMessage('Camera ready. Position your face in the frame and take a photo.');
      }
    } catch (error) {
      console.error("Error starting camera:", error);
      setValidationMessage('Unable to access camera. Please check permissions.');
      setShowCamera(false);
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraReady(false);
  };

  // Take picture from webcam
  const takePicture = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return;
    
    setIsProcessing(true);
    setValidationMessage('Analyzing image...');
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Generate a unique filename with timestamp for cache-busting
      const timestamp = Date.now();
      const fileName = `webcam-photo-${timestamp}.jpg`;
      
      // Convert canvas to blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      const file = new File([blob], fileName, { type: "image/jpeg" });
      
      // Create preview URL
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      
      // If face detection model failed to load, accept the image but warn the user
      if (!modelLoaded) {
        setValidationMessage('Face detection is unavailable. Image accepted without verification.');
        setIsValid(true);
        onImageSelected(file);
        stopCamera();
        setIsProcessing(false);
        return;
      }
      
      // Validate face
      const result = await validateFaceImage(file);
      
      // Update state based on validation
      setValidationMessage(result.message);
      setIsValid(result.valid);
      
      if (result.valid) {
        onImageSelected(file);
        if (result.confidence) {
          setValidationMessage(`Valid human face detected with ${result.confidence}% confidence!`);
        }
        // Close camera on successful capture
        stopCamera();
      } else {
        onImageSelected(null);
      }
    } catch (error) {
      console.error("Error processing camera image:", error);
      setValidationMessage('Error processing image from camera. Try again or upload an image instead.');
      setIsValid(false);
      onImageSelected(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.imageUpload}>
      {!showCamera ? (
        // Image preview and upload interface
        <>
          <div 
            className={`${styles.imagePreview} ${isValid ? styles.valid : ''}`}
            onClick={handleClick}
          >
            {previewUrl ? (
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                style={{objectFit: 'cover'}}
                sizes="(max-width: 768px) 100vw, 300px"
                unoptimized={true} /* Skip Next.js image optimization for dynamic images */
              />
            ) : (
              <div className={styles.placeholder}>
                <span>Click to upload profile picture</span>
              </div>
            )}
            
            {isProcessing && (
              <div className={styles.processing}>
                <div className={styles.spinner}></div>
                <span>Analyzing image...</span>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
          />
          
          {validationMessage && (
            <div className={`${styles.validationMessage} ${isValid ? styles.success : styles.error}`}>
              {validationMessage}
            </div>
          )}
          
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleClick}
              className={styles.uploadButton}
              disabled={isProcessing}
            >
              {previewUrl ? "Change Image" : "Select Image"}
            </button>
            
            <button
              type="button"
              onClick={startCamera}
              className={styles.cameraButton}
              disabled={isProcessing}
            >
              Take Picture
            </button>
          </div>
        </>
      ) : (
        // Camera interface
        <div className={styles.cameraContainer}>
          <video 
            ref={videoRef}
            className={styles.cameraVideo}
            playsInline
            muted
          />
          
          <canvas 
            ref={canvasRef} 
            className={styles.hiddenCanvas}
          />
          
          {validationMessage && (
            <div className={`${styles.validationMessage} ${isValid ? styles.success : styles.error}`}>
              {validationMessage}
            </div>
          )}
          
          <div className={styles.cameraControls}>
            <button
              type="button"
              onClick={takePicture}
              className={`${styles.captureButton} ${!cameraReady ? styles.disabled : ''}`}
              disabled={isProcessing || !cameraReady}
            >
              {isProcessing ? (
                <div className={styles.smallSpinner}></div>
              ) : (
                "Take Photo"
              )}
            </button>
            
            <button
              type="button"
              onClick={stopCamera}
              className={styles.cancelButton}
              disabled={isProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}