import { NextResponse } from 'next/server';
import { fetchLatestTransactions } from '@/app/lib/data';

export async function GET() {
  try {
    // Fetch the latest transactions
    const transactions = await fetchLatestTransactions();
    
    // Return data with comprehensive cache control headers
    return NextResponse.json(
      transactions,
      { 
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Surrogate-Control': 'no-store',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching latest transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch latest transactions' }, { status: 500 });
  }
}