"use client"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "@/app/ui/dashboard/admins/singleAdminPage/singleAdminPage.module.css";
import { updateAdmin, unlockAccount } from "@/app/lib/actions";
import ImageUpload from "@/app/components/ImageUpload";

const SingleAdminPage = () => {
  const params = useParams();
  const { id } = params;
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch(`/api/admins/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch admin data');
        }
        const data = await response.json();
        setAdmin(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    
    // Create FormData from the form
    const formData = new FormData(e.target);
    formData.append('id', id);
    
    // Add the profile image if selected
    if (profileImage) {
      formData.set('profileImage', profileImage);
    }
    
    // Confirm role changes if they're being made
    const newRole = formData.get('role');
    if (newRole !== admin.role) {
      const confirmChange = window.confirm(
        `Are you sure you want to change the role from ${admin.role || 'data_encoder'} to ${newRole}?`
      );
      if (!confirmChange) return;
    }
    
    try {
      const result = await updateAdmin(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("User information updated successfully!");
        // Refresh admin data
        const response = await fetch(`/api/admins/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAdmin(data);
        }
        
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push("/dashboard/admins");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
    }
  };

  const handleUnlock = async (formData) => {
    try {
      const result = await unlockAccount(formData);
      if (result.success) {
        setSuccessMessage("Account unlocked successfully!");
        // Refresh admin data
        const response = await fetch(`/api/admins/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAdmin(data);
        }
      } else {
        setError(result.error || "Failed to unlock account");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while unlocking the account");
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error && !admin) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!admin) {
    return <div className={styles.error}>Admin not found</div>;
  }

  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={styles.success}>{successMessage}</div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.profileFormContainer}>
          {/* Profile Section */}
          <div className={styles.infoContainer}>
            <ImageUpload
              onImageSelected={(file) => setProfileImage(file)}
              initialImage={admin.profileImage}
            />
            
            {/* User Status */}
            <div className={styles.statusContainer}>
              <span className={`${styles.statusBadge} ${admin.accountLocked ? styles.locked : styles.active}`}>
                {admin.accountLocked ? 'Account Locked' : 'Account Active'}
              </span>
              <span className={`${styles.statusBadge} ${styles[admin.role || 'data_encoder']}`}>
                {admin.role === 'system_admin' ? 'System Admin' : 'Data Encoder'}
              </span>
            </div>
          </div>
    
          {/* Form Section */}
          <div className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                defaultValue={admin.username}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" name="email" placeholder="Email" defaultValue={admin.email} />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" name="password" placeholder="Leave empty to keep current password" />
            </div>
    
            <div className={styles.formGroup}>
              <label>Name</label>
              <input type="text" name="name" placeholder="Name" defaultValue={admin.name} />
            </div>

            <div className={styles.formGroup}>
              <label>Role</label>
              <select name="role" defaultValue={admin.role}>
                <option value="data_encoder">Data Encoder</option>
                <option value="system_admin">System Admin</option>
              </select>
              <small className={styles.roleHelp}>
                System Admin can manage users. Data Encoder can only input data.
              </small>
            </div>
          </div>
        </div>
    
        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>Update</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>

      {/* Unlock Account Section */}
      {admin.accountLocked && (
        <form action={handleUnlock} className={styles.unlockForm}>
          <input type="hidden" name="id" value={admin.id || admin._id} />
          <button className={styles.unlockButton}>
            Unlock Account
          </button>
          <p className={styles.helpText}>
            Unlocking will reset login attempts and allow the user to log in again.
          </p>
        </form>
      )}
    </div>
  );
};

export default SingleAdminPage;