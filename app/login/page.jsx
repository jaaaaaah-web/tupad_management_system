'use client';
import { useState, useEffect } from 'react';
import { authenticate } from '@/app/lib/actions';
import Link from 'next/link';
import styles from '@/app/ui/login/login.module.css';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';

// Create initial state
const initialState = { 
  error: null, 
  success: false, 
  requireCaptcha: false,
  isLocked: false
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  
  // Form submission handler with useFormState
  const [state, formAction] = useFormState(authenticate, initialState);
  
  // Handle captcha token changes
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };
  
  // Create a wrapper for formAction to include captcha token
  const submitFormWithCaptcha = (formData) => {
    if (state?.requireCaptcha && captchaToken) {
      formData.append('captchaToken', captchaToken);
    }
    return formAction(formData);
  };
  
  // Handle successful login and redirect
  useEffect(() => {
    if (state?.success) {
      setShowWelcome(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [state, router]);

  return (
    <div className={styles.container}>
      {showWelcome ? (
        <div className={styles.form} style={{ justifyContent: "center" }}>
          <h1 style={{ color: "teal", marginBottom: "20px" }}>Welcome Admin!</h1>
          <p>Redirecting to dashboard...</p>
        </div>
      ) : (
        <form action={submitFormWithCaptcha} className={styles.form}>
          <h1>Login</h1>
          <input 
            type="text" 
            name="username" 
            placeholder="Username"
            required 
          />
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              className={styles.passwordInput}
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          
          {state?.requireCaptcha && (
            <div className={styles.captchaContainer}>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
              />
            </div>
          )}
          
          {state?.isLocked ? (
            <div className={styles.lockedMessage}>
              Your account has been temporarily locked.
              <br />
              Please try again later or contact support.
            </div>
          ) : (
            <button type="submit" disabled={state?.requireCaptcha && !captchaToken}>
              Login
            </button>
          )}
          
          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-blue-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
          
          {state?.error && (
            <p className={styles.error}>{state.error}</p>
          )}
          {state?.showWarning && state.remainingAttempts > 0 && (
  <div className={styles.warningMessage}>
    <p>
      <span className={styles.warningIcon}>⚠️</span> {state.warningMessage}
    </p>
  </div>
)}
        </form>
      )}
    </div>
  );
}