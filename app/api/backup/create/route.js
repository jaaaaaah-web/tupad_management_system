import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { User, Transactions, Announcements, Admins } from '@/app/lib/models';
import { getCurrentUser, isSystemAdmin } from '@/app/lib/auth';

export async function GET() {
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
    
    // Fetch all collections for backup
    const users = await User.find({}).lean();
    const transactions = await Transactions.find({}).lean();
    const announcements = await Announcements.find({}).lean();
    const admins = await Admins.find({}).lean();
    
    // Create backup object with all data
    const backupData = {
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
      },
      collections: {
        users,
        transactions,
        announcements,
        admins,
      },
    };
    
    // Return the backup data as JSON
    return NextResponse.json(backupData);
    
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { message: "Failed to create backup" },
      { status: 500 }
    );
  }
}