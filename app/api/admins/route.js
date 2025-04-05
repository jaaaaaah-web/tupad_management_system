import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { Admins } from '@/app/lib/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDB();

    // Fetch all admins
    const admins = await Admins.find({}).sort({ createdAt: -1 });
    
    // Convert to plain objects for serialization
    const serializedAdmins = JSON.parse(JSON.stringify(admins));

    return NextResponse.json({ 
      admins: serializedAdmins, 
      count: serializedAdmins.length 
    });
  } catch (error) {
    console.error('Error fetching admins from API:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}