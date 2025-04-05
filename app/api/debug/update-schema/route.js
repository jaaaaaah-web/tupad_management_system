import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { Admins } from "@/app/lib/models";

export async function GET() {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 });
    }
    
    await connectToDB();
    
    // Find all admins without a role field
    const admins = await Admins.find({});
    let updatedCount = 0;
    
    // Update each admin to have the role field
    for (const admin of admins) {
      if (!admin.role) {
        admin.role = "data_encoder"; // Default role
        await admin.save();
        updatedCount++;
      }
    }
    
    // Promote a specific user to system admin (replace with your username)
    const username = "jahadmin"; // replace with your actual username
    const adminToPromote = await Admins.findOne({ username });
    
    if (adminToPromote) {
      adminToPromote.role = "system_admin";
      await adminToPromote.save();
      
      return NextResponse.json({ 
        success: true, 
        message: `Updated ${updatedCount} users without role. Promoted ${username} to system admin.` 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: `Updated ${updatedCount} users without role. User ${username} not found to promote.` 
      });
    }
  } catch (error) {
    console.error("Error updating schema:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update schema: " + error.message 
    }, { status: 500 });
  }
}