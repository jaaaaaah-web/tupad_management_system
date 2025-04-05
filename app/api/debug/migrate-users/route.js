import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { User } from "@/app/lib/models";

export async function GET() {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 });
    }
    
    await connectToDB();
    
    // Find all users with old schema (having 'name' field)
    const users = await User.find({ name: { $exists: true } });
    let migratedCount = 0;
    let failedCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        // Get current row number or assign a new one
        const lastUser = await User.findOne().sort({ rowNumber: -1 });
        const nextRowNumber = (lastUser && lastUser.rowNumber) ? lastUser.rowNumber + 1 : 1;
        
        // Split name into parts (assuming format is "LastName, FirstName MiddleName")
        // This is an estimate - adjust the logic based on your naming conventions
        let firstName = "", middleName = "", lastName = "";
        if (user.name) {
          const nameParts = user.name.split(' ');
          if (nameParts.length === 1) {
            // Only one name provided
            lastName = nameParts[0];
          } else if (nameParts.length === 2) {
            // First and last name
            firstName = nameParts[0];
            lastName = nameParts[1];
          } else if (nameParts.length >= 3) {
            // First, middle, and last name
            firstName = nameParts[0];
            middleName = nameParts[1];
            lastName = nameParts.slice(2).join(' ');
          }
        }
        
        // Calculate birthday from age (rough estimate - uses current date minus age years)
        const birthday = user.age ? new Date(new Date().setFullYear(new Date().getFullYear() - user.age)) : new Date();
        
        // Update user with new schema fields
        user.rowNumber = nextRowNumber;
        user.firstName = firstName;
        user.middleName = middleName;
        user.lastName = lastName;
        user.cpNumber = user.number || "";
        user.birthday = birthday;
        
        // Save the updated user
        await user.save();
        migratedCount++;
      } catch (err) {
        console.error(`Failed to migrate user ${user._id}:`, err);
        failedCount++;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Migrated ${migratedCount} users to new schema. Failed: ${failedCount}` 
    });
  } catch (error) {
    console.error("Error migrating users:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to migrate users: " + error.message 
    }, { status: 500 });
  }
}