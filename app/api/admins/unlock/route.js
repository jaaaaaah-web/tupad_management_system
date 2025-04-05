import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { Admins } from '@/app/lib/models';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Check authentication using cookies
    const adminId = cookies().get("auth-token")?.value;
    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectToDB();

    // Verify the admin has system_admin role
    const requestingAdmin = await Admins.findById(adminId);
    if (!requestingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }

    // Check if user has system_admin role
    if (requestingAdmin.role !== 'system_admin') {
      return NextResponse.json({ error: 'Not authorized to unlock admin accounts' }, { status: 403 });
    }

    // Get admin ID from request
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Update the admin account
    const result = await Admins.findByIdAndUpdate(id, {
      accountLocked: false,
      loginAttempts: 0,
      lockUntil: null
    });
    
    if (!result) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Admin account unlocked successfully' });
  } catch (error) {
    console.error('Error unlocking admin account:', error);
    return NextResponse.json({ error: 'Failed to unlock admin account' }, { status: 500 });
  }
}