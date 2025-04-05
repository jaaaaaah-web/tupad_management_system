import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    await connectToDB();
    
    // Get username from query string
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username') || 'jahadmin';
    
    // Get direct access to the collection
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // Find the user
    const user = await adminsCollection.findOne({ username });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: `User ${username} not found` 
      }, { status: 404 });
    }
    
    // Log the entire user object for debugging
    console.log("User from DB:", user);
    
    return NextResponse.json({ 
      success: true,
      user: {
        username: user.username,
        role: user.role || "No role field found",
        fields: Object.keys(user)
      }
    });
  } catch (error) {
    console.error("Error checking role:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to check role: " + error.message 
    }, { status: 500 });
  }
}