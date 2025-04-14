// This script will fix the MongoDB index issue causing E11000 duplicate key errors
import { connectToDB } from './utils';
import mongoose from 'mongoose';

export const fixDatabaseIndexes = async () => {
  try {
    console.log("Starting database index fix process...");
    
    // Connect to database
    await connectToDB();
    
    // Get direct reference to the transactions collection
    console.log("Getting reference to transactions collection...");
    const transactionsCollection = mongoose.connection.collection('transactions');
    
    // Step 1: Check if the unique index exists
    console.log("Checking existing indexes...");
    const indexes = await transactionsCollection.indexes();
    console.log("Current indexes:", indexes);
    
    // Step 2: Find the beneficiaries index if it exists
    const beneficiariesIndex = indexes.find(index => 
      index.key && index.key.beneficiaries === 1 && index.unique === true
    );
    
    // Step 3: Drop the unique index if found
    if (beneficiariesIndex) {
      console.log("Found unique index on beneficiaries field:", beneficiariesIndex);
      console.log("Dropping unique index...");
      await transactionsCollection.dropIndex("beneficiaries_1");
      console.log("Successfully dropped unique index on beneficiaries field");
    } else {
      console.log("No unique index found on beneficiaries field");
    }
    
    // Step 4: Create a non-unique index instead
    console.log("Creating non-unique index on beneficiaries field...");
    await transactionsCollection.createIndex({ beneficiaries: 1 }, { unique: false });
    
    // Step 5: Verify the fix
    const updatedIndexes = await transactionsCollection.indexes();
    console.log("Updated indexes:", updatedIndexes);
    
    console.log("Database index fix completed successfully");
    return { success: true, message: "Database index fix completed successfully" };
  } catch (error) {
    console.error("Error fixing database indexes:", error);
    return { success: false, error: error.message };
  }
};

// Export a function that can be called from a route handler
export const fixDatabase = async () => {
  try {
    return await fixDatabaseIndexes();
  } catch (error) {
    console.error("Error in fixDatabase:", error);
    return { success: false, error: error.message };
  }
};