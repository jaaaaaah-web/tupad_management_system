import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { Admins } from "@/app/lib/models";

export async function GET() {
  try {
    await connectToDB();
    
    // Get all admins for debugging
    const admins = await Admins.find({}).select("-password");
    
    return NextResponse.json({ 
      success: true, 
      count: admins.length,
      admins: admins.map(admin => {
        const plainAdmin = admin.toObject();
        plainAdmin.id = plainAdmin._id.toString();
        return plainAdmin;
      })
    });
  } catch (error) {
    console.error("Error in debug API:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}