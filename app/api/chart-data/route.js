import { fetchBeneficiariesByPurokAndAge } from "@/app/lib/data";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await fetchBeneficiariesByPurokAndAge();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}