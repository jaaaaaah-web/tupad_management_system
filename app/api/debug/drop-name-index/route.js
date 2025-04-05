import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 });
    }
    
    await connectToDB();
    
    // Get the MongoDB connection
    const db = mongoose.connection.db;
    
    // Get collection info
    const collections = await db.listCollections().toArray();
    
    // Look for the users collection
    const usersCollection = collections.find(c => c.name === 'users');
    
    if (!usersCollection) {
      return NextResponse.json({ 
        success: false, 
        message: "Users collection not found" 
      });
    }
    
    // Get the indexes on the collection
    const indexes = await db.collection('users').indexes();
    console.log("Current indexes:", indexes);
    
    // Check if there's an index on the name field
    const nameIndex = indexes.find(idx => 
      idx.key && idx.key.name === 1 && idx.unique === true
    );
    
    if (nameIndex) {
      // Drop the unique index on the name field
      await db.collection('users').dropIndex("name_1");
      
      return NextResponse.json({ 
        success: true, 
        message: "Successfully dropped the unique index on the name field" 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: "No unique index on name field found to drop" 
      });
    }
  } catch (error) {
    console.error("Error dropping index:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to drop index: " + error.message 
    }, { status: 500 });
  }
}