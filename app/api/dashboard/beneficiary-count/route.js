import { NextResponse } from 'next/server';
import { fetchBeneficiariesCount } from '@/app/lib/data';

export async function GET() {
  try {
    // Fetch beneficiaries count
    const count = await fetchBeneficiariesCount();
    
    // Return data with cache control headers to prevent excessive caching
    return NextResponse.json(
      { count },
      { 
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'Surrogate-Control': 'no-store'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching beneficiaries count:', error);
    return NextResponse.json({ error: 'Failed to fetch beneficiaries count' }, { status: 500 });
  }
}