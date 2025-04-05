import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { Admins } from "@/app/lib/models";
import mongoose from "mongoose";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  try {
    // Authorization check
    const adminId = cookies().get("auth-token")?.value;
    console.log("Auth token:", adminId);
    
    if (!adminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    await connectToDB();
    
    // Check if requesting user is system admin
    const requestingAdmin = await Admins.findById(adminId);
    console.log("Requesting admin:", requestingAdmin ? {
      username: requestingAdmin.username,
      role: requestingAdmin.role || "No role"
    } : "Not found");
    
    // FOR DEBUGGING - TEMPORARILY SKIP ROLE CHECK
    // Comment this out when your system is working properly
    /* 
    if (!requestingAdmin || requestingAdmin.role !== "system_admin") {
      return NextResponse.json({ 
        error: "Unauthorized access", 
        userRole: requestingAdmin?.role || "none"
      }, { status: 403 });
    }
    */
    
    // Get the requested admin data
    const { id } = params;
    console.log("Requested admin ID:", id);
    
    let admin;
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      admin = await Admins.findById(id);
    } else {
      return NextResponse.json({ error: "Invalid admin ID format" }, { status: 400 });
    }
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    console.log("Found admin:", admin.username);
    
    // Return the admin data
    return NextResponse.json({
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      name: admin.name,
      profileImage: admin.profileImage,
      role: admin.role || "data_encoder",
      accountLocked: admin.accountLocked || false,
      loginAttempts: admin.loginAttempts || 0,
      createdAt: admin.createdAt
    });
  } catch (error) {
    console.error("Error fetching admin:", error);
    return NextResponse.json({ 
      error: "Failed to fetch admin data", 
      details: error.message 
    }, { status: 500 });
  }
}