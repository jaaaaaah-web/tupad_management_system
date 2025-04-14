import { fetchBeneficiariesByPurokAndAge } from "@/app/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await fetchBeneficiariesByPurokAndAge();
    return NextResponse.json(
      result,
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
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}