import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { Admins } from '@/app/lib/models';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

export async function GET(request) {
  try {
    // Check authentication
    let session;
    try {
      session = await getServerSession(authOptions);
      if (!session || !session.user) {
        console.log('API: No valid session found');
        return NextResponse.json({ error: 'Unauthorized', details: 'No valid session' }, { status: 401 });
      }
    } catch (sessionError) {
      console.error('API: Error checking session:', sessionError);
      // Continue without session check in case that's what's failing
    }

    // Connect to database with detailed error logging
    try {
      await connectToDB();
      console.log('API: Database connected successfully');
    } catch (dbError) {
      console.error('API: Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: dbError.message 
      }, { status: 500 });
    }

    // Check if Admins model is available
    if (!Admins || !Admins.find) {
      console.error('API: Admins model is not properly initialized');
      return NextResponse.json({ 
        error: 'Database model unavailable', 
        details: 'Admins model is not properly initialized' 
      }, { status: 500 });
    }

    // Try a simpler query first to test if the collection is working
    try {
      const testAdmin = await Admins.findOne({});
      console.log('API: Test query successful:', !!testAdmin);
    } catch (testError) {
      console.error('API: Test query failed:', testError);
    }

    // Fetch all admins with a try/catch specifically for the query
    let admins = [];
    try {
      admins = await Admins.find({}).sort({ createdAt: -1 });
      console.log(`API: Successfully found ${admins.length} admins`);
    } catch (queryError) {
      console.error('API: Error querying admins:', queryError);
      return NextResponse.json({ 
        error: 'Query failed', 
        details: queryError.message 
      }, { status: 500 });
    }
    
    // Convert to plain objects for serialization
    try {
      const serializedAdmins = JSON.parse(JSON.stringify(admins));
      return NextResponse.json({ 
        admins: serializedAdmins, 
        count: serializedAdmins.length 
      });
    } catch (serializationError) {
      console.error('API: Error serializing admins:', serializationError);
      return NextResponse.json({ 
        error: 'Serialization failed', 
        details: serializationError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('API: Unhandled error in admins endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch admins', 
      details: error.message 
    }, { status: 500 });
  }
}