import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    // Get parameters from the URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    const newRole = searchParams.get('role') || 'system_admin';
    
    // Validate inputs
    if (!userId) {
      return NextResponse.json({ 
        error: "Missing id parameter", 
        usage: "/api/debug/force-role-update?id=USER_ID&role=system_admin" 
      }, { status: 400 });
    }
    
    if (!mongoose.connection.readyState) {
      // Connect to database if not connected
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Get direct collection access
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // First, find the user to verify it exists
    const user = await adminsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(userId) 
    });
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }
    
    console.log("Before update - User:", {
      id: user._id.toString(),
      username: user.username,
      role: user.role || "not set"
    });
    
    // Update the role directly
    const result = await adminsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { 
        $set: { role: newRole },
        // Also ensure the field exists in schema validation if you have it
        $setOnInsert: { 
          // Will only be used for new documents
          // Put any required fields here
        }
      }
    );
    
    // Verify update - fetch the user again
    const updatedUser = await adminsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(userId) 
    });
    
    return NextResponse.json({
      success: result.modifiedCount > 0,
      updateResult: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      },
      before: {
        username: user.username,
        role: user.role || "not set"
      },
      after: {
        username: updatedUser.username,
        role: updatedUser.role || "not set"
      }
    });
    
  } catch (error) {
    console.error("Error in force-role-update:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}