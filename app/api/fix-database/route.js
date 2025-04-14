import { NextResponse } from 'next/server';
import { fixDatabase } from '@/app/lib/databaseFix';

// This API route will fix the database index issue
export async function GET() {
  try {
    // Run the database fix script
    const result = await fixDatabase();
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running database fix:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}