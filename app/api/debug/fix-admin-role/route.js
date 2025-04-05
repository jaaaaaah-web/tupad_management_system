import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDB();
    
    // Direct DB access to bypass schema issues
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // Force update jahadmin to have system_admin role
    const updateResult = await adminsCollection.updateOne(
      { username: "jahadmin" },
      { $set: { role: "system_admin" } }
    );
    
    // Check other admins and give them data_encoder role if missing role
    const fixResult = await adminsCollection.updateMany(
      { role: { $exists: false } },
      { $set: { role: "data_encoder" } }
    );
    
    // Find the updated admin to verify
    const admin = await adminsCollection.findOne({ username: "jahadmin" });
    
    return NextResponse.json({
      success: true,
      updateResult: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      },
      fixResult: {
        matchedCount: fixResult.matchedCount,
        modifiedCount: fixResult.modifiedCount
      },
      adminAfterUpdate: {
        username: admin.username,
        role: admin.role,
        allFields: Object.keys(admin)
      }
    });
  } catch (error) {
    console.error("Error fixing admin role:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}