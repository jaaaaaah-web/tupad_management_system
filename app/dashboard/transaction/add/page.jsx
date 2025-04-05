"use client"

import React from 'react';
import styles from "@/app/ui/dashboard/transactions/singleTransactions/singleTransactions.module.css";
import { addTransactions } from '@/app/lib/actions';
import { useRouter } from 'next/navigation';

const CreateTransactionPage = () => {
  const router = useRouter();
  
  // Function to handle form submission and combine names for beneficiaries
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    
    // Get name values
    const lastName = formData.get("lastName") || "";
    const middleName = formData.get("middleName") || "";
    const firstName = formData.get("firstName") || "";
    
    // Create beneficiaries field value
    const beneficiaries = `${lastName}, ${firstName} ${middleName}`.trim();
    
    // Set the hidden beneficiaries field
    formData.set("beneficiaries", beneficiaries);
    
    // Submit the form with the modified formData
    await addTransactions(formData);
    
    // Redirect back to transactions list
    router.push('/dashboard/transaction');
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input type="hidden" name="beneficiaries" defaultValue="" />
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <div>
              <label>Created By</label>
              <input type="text" name="cb" placeholder="Enter created by" required />
            </div>
            <div>
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="Enter last name" required />
            </div>
            <div>
              <label>Middle Name</label>
              <input type="text" name="middleName" placeholder="Enter middle name (optional)" />
            </div>
            <div>
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="Enter first name" required />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Status</label>
              <select name="status" id="status" className={styles.a} defaultValue="Pending">
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label>Amount</label>
              <input type="number" name="amount" placeholder="Enter amount" required />
            </div>
          </div>
          <button type="submit">Create Payout</button>
        </div>
      </form>
    </div>
  );
};

export default CreateTransactionPage;
