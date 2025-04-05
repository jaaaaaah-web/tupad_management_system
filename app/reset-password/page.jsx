'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/app/reset-password/reset-password.module.css';

// Component with suspense boundary for client-side operations
function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Password validation state
  const [validations, setValidations] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // No token in URL, redirect to forgot password
      router.push('/forgot-password');
    }
  }, [searchParams, router]);

  useEffect(() => {
    // Validate password in real-time
    setValidations({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const isPasswordValid = Object.values(validations).every(Boolean);
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setMessageType('error');
      setMessage('Please meet all password requirements');
      return;
    }
    
    if (!doPasswordsMatch) {
      setMessageType('error');
      setMessage('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessageType('success');
        setMessage('Password reset successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to reset password');
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
        <h2 className={styles.title}>Reset Password</h2>
        
        {message && (
          <div className={`${styles.message} ${messageType === 'success' ? styles.success : styles.error}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              New Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            {confirmPassword && !doPasswordsMatch && (
              <p className={styles.mismatchError}>Passwords do not match</p>
            )}
          </div>
          
          <div className={styles.requirementsContainer}>
            <p className={styles.requirementsTitle}>Password Requirements:</p>
            <ul className={styles.requirementsList}>
              <li className={validations.minLength ? styles.validRequirement : styles.invalidRequirement}>
                {validations.minLength ? "✓" : "○"} Minimum 8 characters
              </li>
              <li className={validations.hasUppercase ? styles.validRequirement : styles.invalidRequirement}>
                {validations.hasUppercase ? "✓" : "○"} At least one uppercase letter
              </li>
              <li className={validations.hasLowercase ? styles.validRequirement : styles.invalidRequirement}>
                {validations.hasLowercase ? "✓" : "○"} At least one lowercase letter
              </li>
              <li className={validations.hasNumber ? styles.validRequirement : styles.invalidRequirement}>
                {validations.hasNumber ? "✓" : "○"} At least one number
              </li>
              <li className={validations.hasSymbol ? styles.validRequirement : styles.invalidRequirement}>
                {validations.hasSymbol ? "✓" : "○"} At least one special character
              </li>
            </ul>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
            className={styles.submitButton}
          >
            {isLoading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
        
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
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.formContainer}>Loading...</div></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}