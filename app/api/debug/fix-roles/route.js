import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectToDB();
    
    // Get direct access to the collection (bypassing schema validation)
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // Update all records to add the role field if missing
    const result = await adminsCollection.updateMany(
      { role: { $exists: false } },
      { $set: { role: "data_encoder" } }
    );
    
    // Promote your specific user
    const promoteResult = await adminsCollection.updateOne(
      { username: "jahadmin" },
      { $set: { role: "system_admin" } }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${result.modifiedCount} records. Promotion result: ${promoteResult.modifiedCount} record(s) modified.`
    });
  } catch (error) {
    console.error("Error updating schema:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update schema: " + error.message 
    }, { status: 500 });
  }
}