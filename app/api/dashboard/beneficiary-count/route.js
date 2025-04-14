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
          'Expires': '0',
          // Special Vercel header to bypass edge caching
          'x-vercel-cache-control-bypass': process.env.VERCEL_URL ? 'true' : undefined,
          // Force timestamp response header to prevent browser caching
          'x-timestamp': new Date().getTime().toString()
        }
      }
    );
  } catch (error) {
    console.error('Error fetching beneficiaries count:', error);
    return NextResponse.json({ error: 'Failed to fetch beneficiaries count' }, { status: 500 });
  }
}