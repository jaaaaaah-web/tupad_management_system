import React from 'react'
import styles from "@/app/ui/dashboard/users/addUserPage/addUsersPage.module.css"
import { addUser } from '@/app/lib/actions';

const AddUserPage = () => {
  return (
    <div className={styles.container}>
      <form action={addUser} className={styles.form}>
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <div>
              <label>First Name</label>
              <input type="text" placeholder="First Name" name="firstName" required className={styles.transparentInput} />
            </div>
            <div>
              <label>Middle Name</label>
              <input type="text" placeholder="Middle Name" name="middleName" className={styles.transparentInput} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label>Last Name</label>
              <input type="text" placeholder="Last Name" name="lastName" required className={styles.transparentInput} />
            </div>
            <div>
              <label>CP Number</label>
              <input type="text" placeholder="CP Number" name="cpNumber" required className={styles.transparentInput} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label>Purok</label>
              <input type="text" placeholder="Purok" name="purok" required className={styles.transparentInput} />
            </div>
            <div>
              <label>Profession</label>
              <input type="text" placeholder="Profession" name="profession" required className={styles.transparentInput} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label>Birthday</label>
              <input 
                type="date" 
                placeholder="Birthday" 
                name="birthday" 
                required 
                className={styles.transparentInput} 
              />
            </div>
          </div>

          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default AddUserPage
