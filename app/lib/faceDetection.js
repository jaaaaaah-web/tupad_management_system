"use client"

import * as faceapi from 'face-api.js';
import Resizer from 'react-image-file-resizer';

// Track if models are loaded
let modelsLoaded = false;
let modelsLoading = false;

// Load face detection models
export const loadFaceDetectionModels = async () => {
  if (modelsLoaded) return;
  if (modelsLoading) {
    // Wait for models to finish loading if already in progress
    await new Promise((resolve) => {
      const checkLoaded = () => {
        if (modelsLoaded) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
    });
    return;
  }
  
  modelsLoading = true;
  
  try {
    // Load core models first
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    
    // Try to load additional models if available
    try {
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      await faceapi.nets.ageGenderNet.loadFromUri('/models');
      console.log('All face detection models loaded including expressions and age/gender');
    } catch (additionalError) {
      console.warn('Core face detection models loaded, but additional models failed:', additionalError);
      // We can still proceed with core models
    }
    
    modelsLoaded = true;
    console.log('Face detection models loaded');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    modelsLoading = false;
    throw error;
  } finally {
    modelsLoading = false;
  }
};

// Resize image to reduce processing time
export const resizeImage = (file) => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      600, // max width
      600, // max height
      'JPEG',
      90, // quality
      0, // rotation
      (uri) => {
        resolve(uri);
      },
      'base64'
    );
  });
};

// Enhanced face detection with error handling
export const detectFaces = async (imageElement) => {
  if (!modelsLoaded) {
    await loadFaceDetectionModels();
  }
  
  try {
    // Start with basic detection
    let detections = await faceapi.detectAllFaces(
      imageElement,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 })
    );
    
    // Try to add landmarks if available
    try {
      detections = await faceapi.detectAllFaces(
        imageElement,
        new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 })
      ).withFaceLandmarks();
      
      // Try to add expressions and age/gender if those models loaded
      try {
        detections = await faceapi.detectAllFaces(
          imageElement,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 })
        ).withFaceLandmarks().withFaceExpressions().withAgeAndGender();
      } catch (expressionError) {
        console.warn('Face expressions or age/gender detection failed, using landmarks only:', expressionError);
      }
    } catch (landmarkError) {
      console.warn('Face landmarks detection failed, using basic detection only:', landmarkError);
    }
    
    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    throw error;
  }
};

// Check if a face is likely human by analyzing facial features
const isLikelyHumanFace = (detection) => {
  // Face should have a high detection score
  if (detection.detection && detection.detection.score < 0.8) {
    return { isHuman: false, reason: 'Low confidence in face detection' };
  }
  
  // If we have landmarks, check them
  if (detection.landmarks && detection.landmarks.positions) {
    const positions = detection.landmarks.positions;
    
    // Check if enough landmarks were detected (basic check)
    if (positions.length < 20) {
      return { isHuman: false, reason: 'Insufficient facial landmarks detected' };
    }
    
    // Try to check eyes if the landmarks are available
    try {
      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();
      if (!leftEye.length || !rightEye.length) {
        return { isHuman: false, reason: 'Eyes not properly detected' };
      }
    } catch (error) {
      // If we can't get eyes, just continue
      console.warn('Could not check eye landmarks:', error);
    }
  }
  
  // Check expressions if available
  if (detection.expressions) {
    const expressions = detection.expressions;
    const hasValidExpressions = Object.values(expressions).some(val => val > 0.1);
    if (!hasValidExpressions) {
      return { isHuman: false, reason: 'No valid facial expressions detected' };
    }
  }
  
  // Check age if available
  if (detection.age !== undefined) {
    const age = detection.age;
    if (age < 5 || age > 100) {
      return { isHuman: false, reason: 'Unrealistic age estimation' };
    }
  }
  
  return { isHuman: true, reason: 'Passed all available human face checks' };
};

// Validate that the image contains exactly one human face
export const validateFaceImage = async (file) => {
  if (!file) {
    return { valid: false, message: 'No image file provided.' };
  }
  
  try {
    // Create URL for the image
    const imageUrl = URL.createObjectURL(file);
    
    // Load the image
    const img = document.createElement('img');
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
    
    // Detect faces with enhanced features
    const detections = await detectFaces(img);
    
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imageUrl);
    
    if (!detections || detections.length === 0) {
      return { valid: false, message: 'No face detected in the image.' };
    }
    
    if (detections.length > 1) {
      return { valid: false, message: 'Multiple faces detected. Please use an image with a single face.' };
    }
    
    // Enhanced human face verification
    const humanCheck = isLikelyHumanFace(detections[0]);
    if (!humanCheck.isHuman) {
      return { 
        valid: false, 
        message: `The detected face doesn't appear to be human: ${humanCheck.reason}` 
      };
    }
    
    // Get the confidence score (if available)
    let confidence = 90; // Default if not available
    if (detections[0].detection && detections[0].detection.score) {
      confidence = Math.round(detections[0].detection.score * 100);
    }
    
    return { 
      valid: true, 
      message: 'Valid human face detected.',
      confidence: confidence
    };
  } catch (error) {
    console.error('Error validating face image:', error);
    return { valid: false, message: 'Error validating image: ' + error.message };
  }
};