import { NextResponse } from 'next/server';
import { fetchTotalPayoutAmount } from '@/app/lib/data';

export async function GET(request) {
  try {
    // Get the year from the query parameters
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    
    // Fetch total payout amount for the specified year
    const amount = await fetchTotalPayoutAmount(year);
    
    // Create response with comprehensive cache control headers
    return NextResponse.json(
      { amount },
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
    console.error('Error fetching payout amount:', error);
    return NextResponse.json({ error: 'Failed to fetch payout amount' }, { status: 500 });
  }
}