import React from 'react'
import styles from "@/app/ui/dashboard/users/singleUser/singleUser.module.css";
import { fetchUser } from '@/app/lib/data';
import { updateUser } from '@/app/lib/actions';

const SingleUserpage = async ({params}) => {
  const {id} = params;
  const user = await fetchUser(id);

  // Format date for display in the input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Ensure we have a string ID
  const userId = user?._id?.toString();

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
        </div>
        
      </div>
     
      <form action={updateUser} className={styles.form}>
        <input type="hidden" name="id" value={userId} />
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <div>
              <label>First Name</label>
              <input type="text" name="firstName" placeholder={user?.firstName} defaultValue={user?.firstName} />
            </div>
            <div>
              <label>Middle Name</label>
              <input type="text" name="middleName" placeholder={user?.middleName} defaultValue={user?.middleName} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder={user?.lastName} defaultValue={user?.lastName} />
            </div>
            <div>
              <label>Extension</label>
              <input type="text" name="extension" placeholder="Jr., Sr., III, etc." defaultValue={user?.extension} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label>CP Number</label>
              <input type="text" name="cpNumber" placeholder={user?.cpNumber} defaultValue={user?.cpNumber} />
            </div>
            <div>
              <label>Purok</label>
              <input type="text" name="purok" placeholder={user?.purok} defaultValue={user?.purok} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label>Profession</label>
              <input type="text" name="profession" placeholder={user?.profession} defaultValue={user?.profession} />
            </div>
            <div>
              <label>Birthday</label>
              <input 
                type="date" 
                name="birthday" 
                defaultValue={formatDateForInput(user?.birthday)} 
              />
            </div>
          </div>

          <button type="submit">Update</button>
        </div>
      </form>
    </div>
  );
}

export default SingleUserpage;