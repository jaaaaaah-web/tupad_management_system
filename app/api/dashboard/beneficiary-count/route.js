import { NextResponse } from 'next/server';
import { fetchBeneficiariesCount } from '@/app/lib/data';

export async function GET() {
  try {
    // Fetch beneficiaries count
    const count = await fetchBeneficiariesCount();
    
    // Return data with comprehensive cache control headers
    return NextResponse.json(
      { count },
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
    console.error('Error fetching beneficiaries count:', error);
    return NextResponse.json({ error: 'Failed to fetch beneficiaries count' }, { status: 500 });
  }
}