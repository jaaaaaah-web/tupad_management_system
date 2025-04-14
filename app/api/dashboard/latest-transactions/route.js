import { NextResponse } from 'next/server';
import { fetchLatestTransactions } from '@/app/lib/data';

export async function GET() {
  try {
    // Fetch the latest transactions
    const transactions = await fetchLatestTransactions();
    
    // Return data with cache control headers to prevent excessive caching
    return NextResponse.json(
      transactions,
      { 
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching latest transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch latest transactions' }, { status: 500 });
  }
}