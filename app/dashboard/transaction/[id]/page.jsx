import React from 'react';
import styles from "@/app/ui/dashboard/transactions/singleTransactions/singleTransactions.module.css";
import { fetchTransactions } from '@/app/lib/data';
import { updateTransactions } from '@/app/lib/actions';
import PrintButton from '@/app/components/PrintButton';

const SingleTransactionPage = async ({params}) => {
  const { id } = params;
  const transaction = await fetchTransactions(id);

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
        </div>
      </div>

      <form action={updateTransactions} className={styles.form}>
        <input type="hidden" name="id" value={transaction.id} />
        <div className={styles.formContainer}>
          <div className={styles.row}>
            <div>
              <label>Created By</label>
              <input type="text" name="cb" defaultValue={transaction.cb} />
            </div>
            <div>
              <label>Last Name</label>
              <input type="text" name="lastName" defaultValue={transaction.lastName} />
            </div>
            <div>
              <label>Middle Name</label>
              <input type="text" name="middleName" defaultValue={transaction.middleName || ''} />
            </div>
            <div>
              <label>First Name</label>
              <input type="text" name="firstName" defaultValue={transaction.firstName} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Status</label>
              <select name="status" id="status" className={styles.a} defaultValue={transaction.status}>
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label>Amount</label>
              <input type="number" name="amount" defaultValue={transaction.amount} />
            </div>
          </div>
          <button type="submit">Update</button>
        </div>
      </form>

      {/* Payout History Section */}
      <div className={styles.payoutHistory} id="printableArea">
        <h2>Payout History</h2>
        <div className={styles.historyHeader}>
          <div className={styles.printButtonContainer}>
            <PrintButton />
          </div>
        </div>

        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>Payout ID</th>
              <th>Beneficiary</th>
              <th>Created By</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date Received</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{transaction.id}</td>
              <td>{`${transaction.lastName || ''}, ${transaction.firstName || ''} ${transaction.middleName || ''}`}</td>
              <td>{transaction.cb}</td>
              <td>₱{transaction.amount}</td>
              <td>
                <span className={`${styles.status} ${
                  transaction.status === "Pending" 
                    ? styles.pending 
                    : transaction.status === "Cancelled" 
                      ? styles.cancelled 
                      : transaction.status === "Done" 
                        ? styles.done 
                        : ""
                }`}>
                  {transaction.status}
                </span>
              </td>
              <td>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "N/A"}</td>
            </tr>
          </tbody>
        </table>

        <div className={styles.payoutSummary}>
          <div className={styles.summaryItem}>
            <strong>Transaction ID:</strong> {transaction.id}
          </div>
          <div className={styles.summaryItem}>
            <strong>Beneficiary:</strong> {`${transaction.lastName || ''}, ${transaction.firstName || ''} ${transaction.middleName || ''}`}
          </div>
          <div className={styles.summaryItem}>
            <strong>Created By:</strong> {transaction.cb}
          </div>
          <div className={styles.summaryItem}>
            <strong>Amount:</strong> ₱{transaction.amount}
          </div>
          <div className={styles.summaryItem}>
            <strong>Status:</strong> {transaction.status}
          </div>
          <div className={styles.summaryItem}>
            <strong>Date:</strong> {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleTransactionPage;