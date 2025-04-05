import { cookies } from "next/headers";
import { connectToDB } from "@/app/lib/utils";
import { Admins } from "@/app/lib/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminId = cookies().get("auth-token")?.value;
    
    if (!adminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    await connectToDB();
    
    // Make sure to use lean() to get a plain object
    const admin = await Admins.findById(adminId).lean();
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    console.log("Admin from DB:", admin); // Debug log
    
    return NextResponse.json({
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name || admin.username,
      email: admin.email,
      profileImage: admin.profileImage,
      role: admin.role // Return the role from DB
    });
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}