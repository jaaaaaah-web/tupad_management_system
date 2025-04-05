import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectToDB } from "@/app/lib/utils";
import mongoose from "mongoose";

export async function GET() {
  try {
    const adminId = cookies().get("auth-token")?.value;
    
    if (!adminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    await connectToDB();
    
    // Direct DB access
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // Convert string ID to ObjectId
    const admin = await adminsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(adminId) 
    });
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: admin._id.toString(),
      username: admin.username,
      role: admin.role || "No role field",
      isSystemAdmin: admin.role === "system_admin",
      allFields: Object.keys(admin)
    });
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}