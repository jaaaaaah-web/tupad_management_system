"use client"

import { useState } from "react";
import styles from "@/app/ui/dashboard/admins/AddAdminPage/addAdminPage.module.css";
import { useRouter } from "next/navigation";
import { addAdmin } from "@/app/lib/actions";
import ImageUpload from "@/app/components/ImageUpload";

const AddAdminPage = () => {
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!profileImage) {
      setError("Please select a valid profile image with a human face");
      return;
    }
    
    const formData = new FormData(e.target);
    formData.set('profileImage', profileImage);
    
    try {
      const result = await addAdmin(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard/admins");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong!");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.profileFormContainer}>
          {/* Profile Image Section */}
          <div className={styles.profileSection}>
            <ImageUpload onImageSelected={(file) => setProfileImage(file)} />
          </div>

          {/* Form Fields Section */}
          <div className={styles.inputSection}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input type="text" name="username" placeholder="Username" required />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" name="email" placeholder="Email" required />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" name="password" placeholder="Password" required />
            </div>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input type="text" name="name" placeholder="Name" />
            </div>
            <div className={styles.formGroup}>
              <label>Role</label>
              <select name="role" required>
                <option value="system_admin">System Admin</option>
                <option value="data_encoder">Data Encoder</option>
              </select>
            </div>
            <button type="submit" className={styles.submitButton} disabled={!profileImage}>
              Submit
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddAdminPage;
