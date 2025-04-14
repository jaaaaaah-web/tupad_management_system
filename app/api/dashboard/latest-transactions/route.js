import { NextResponse } from 'next/server';
import { connectToDB } from '@/app/lib/utils';
import { Transactions } from '@/app/lib/models';

export async function GET() {
  try {
    await connectToDB();
    
    // Directly fetch latest transactions instead of using the utility function
    // This ensures we always get the freshest data, especially for new records
    const transactions = await Transactions.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Convert to plain objects with proper data formatting
    const formattedTransactions = transactions.map(doc => {
      // Ensure MongoDB ObjectId is properly converted to string
      const plainDoc = { ...doc, _id: doc._id.toString() };
      
      // If there are any Date objects, ensure they're serialized properly
      if (plainDoc.createdAt) {
        plainDoc.createdAt = new Date(plainDoc.createdAt).toISOString();
      }
      
      return plainDoc;
    });
    
    // Add timestamp to force clients to recognize this as fresh data
    const responseData = {
      timestamp: new Date().toISOString(),
      transactions: formattedTransactions
    };
    
    // Return data with comprehensive cache control headers
    return NextResponse.json(
      formattedTransactions,
      { 
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Surrogate-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching latest transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch latest transactions' }, { status: 500 });
  }
}