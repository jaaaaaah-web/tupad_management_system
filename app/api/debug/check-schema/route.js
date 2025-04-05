import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Admins } from "@/app/lib/models";

export async function GET() {
  try {
    // Check if connected to DB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    // Get the schema
    const adminSchema = Admins.schema;
    
    // Get the fields/paths defined in the schema
    const paths = Object.keys(adminSchema.paths);
    
    // Check if role is properly defined
    const rolePathInfo = adminSchema.paths.role;
    
    return NextResponse.json({
      schemaFields: paths,
      roleFieldInfo: rolePathInfo ? {
        type: rolePathInfo.instance,
        enumValues: rolePathInfo.enumValues,
        defaultValue: rolePathInfo.defaultValue,
        required: rolePathInfo.isRequired
      } : "Role field not found in schema"
    });
    
  } catch (error) {
    console.error("Error checking schema:", error);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}