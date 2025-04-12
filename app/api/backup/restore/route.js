import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { User, Transactions, Announcements, Admins } from '@/app/lib/models';
import { getCurrentUser, isSystemAdmin } from '@/app/lib/auth';
import { logger } from '@/app/lib/logger';

export async function POST(request) {
  try {
    // First check if the user has system_admin role
    const user = await getCurrentUser();
    
    if (!user || !isSystemAdmin(user)) {
      return NextResponse.json(
        { message: "Not authorized" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    await connectToDB();
    
    // Parse the form data
    const formData = await request.formData();
    const backupFile = formData.get('backupFile');
    
    if (!backupFile) {
      return NextResponse.json(
        { message: "No backup file provided" },
        { status: 400 }
      );
    }
    
    // Read the file content
    const fileContent = await backupFile.text();
    let backupData;
    
    try {
      backupData = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid backup file format" },
        { status: 400 }
      );
    }
    
    // Validate backup data structure
    if (!backupData.collections || 
        !backupData.metadata || 
        !backupData.metadata.version) {
      return NextResponse.json(
        { message: "Invalid backup data structure" },
        { status: 400 }
      );
    }
    
    // Log restore operation
    logger.info(`Database restore initiated by admin`);
    
    // Restore collections one by one
    const collections = backupData.collections;
    
    // Restore users collection
    if (collections.users && Array.isArray(collections.users)) {
      // First clear the existing data
      await User.deleteMany({});
      
      // Insert new data
      if (collections.users.length > 0) {
        await User.insertMany(collections.users);
      }
    }
    
    // Restore transactions collection
    if (collections.transactions && Array.isArray(collections.transactions)) {
      await Transactions.deleteMany({});
      
      if (collections.transactions.length > 0) {
        await Transactions.insertMany(collections.transactions);
      }
    }
    
    // Restore announcements collection
    if (collections.announcements && Array.isArray(collections.announcements)) {
      await Announcements.deleteMany({});
      
      if (collections.announcements.length > 0) {
        await Announcements.insertMany(collections.announcements);
      }
    }
    
    // Restore admins collection
    if (collections.admins && Array.isArray(collections.admins)) {
      await Admins.deleteMany({});
      
      if (collections.admins.length > 0) {
        await Admins.insertMany(collections.admins);
      }
    }
    
    // Log successful restore
    logger.info(`Database restore completed successfully`);
    
    return NextResponse.json({ 
      message: "Database restored successfully",
      timestamp: new Date().toISOString() 
    });
    
  } catch (error) {
    console.error("Error restoring backup:", error);
    logger.error(`Database restore failed: ${error.message}`);
    
    return NextResponse.json(
      { message: "Failed to restore database" },
      { status: 500 }
    );
  }
}