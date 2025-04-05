'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/verify-otp/verify-otp.module.css';

// Component with suspense boundary for client-side operations
function VerifyOtpContent() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL query params
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
    
    // OTP expiration countdown
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [searchParams]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessageType('success');
        setMessage('OTP verified successfully!');
        // Redirect to reset password page with token
        setTimeout(() => {
          router.push(`/reset-password?token=${data.token}`);
        }, 1500);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessageType('success');
        setMessage('New OTP sent to your email');
        setTimeLeft(300); // Reset timer
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setMessageType('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Verify OTP</h2>
        
        {message && (
          <div className={`${styles.message} ${messageType === 'success' ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
        
        <p className={styles.instruction}>
          We sent a one-time password to <strong>{email}</strong>
        </p>
        
        <p className={styles.timer}>
          Time remaining: <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
        </p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="otp" className={styles.label}>
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={styles.input}
              required
              maxLength={6}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || timeLeft === 0}
            className={styles.submitButton}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        
        {timeLeft === 0 ? (
          <button
            onClick={handleResendOtp}
            disabled={isLoading}
            className={styles.resendButton}
          >
            {isLoading ? 'Sending...' : 'Resend OTP'}
          </button>
        ) : (
          <p className={styles.resendInfo}>
            Didn't receive the code? You can resend when the timer expires.
          </p>
        )}
        
        <div className={styles.backLink}>
          <Link href="/login">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component with suspense boundary
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.formContainer}>Loading...</div></div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}