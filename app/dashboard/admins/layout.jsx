import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectToDB } from "@/app/lib/utils";
import mongoose from "mongoose";

export default async function AdminLayout({ children }) {
  try {
    const adminId = cookies().get("auth-token")?.value;
    
    if (!adminId) {
      return redirect("/login");
    }
    
    await connectToDB();
    
    // Use direct database access to bypass any schema issues
    const db = mongoose.connection.db;
    const adminsCollection = db.collection('admins');
    
    // Find admin by ID (convert string ID to ObjectId)
    const admin = await adminsCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(adminId) 
    });
    
    // Debug log - you can see this in your server console
    console.log("Admin access check:", {
      adminId,
      adminFound: !!admin,
      role: admin?.role
    });
    
    if (!admin || admin.role !== "system_admin") {
      console.log("Unauthorized access attempt to admin section");
      return redirect("/dashboard");
    }
    
    // Allow access if admin has system_admin role
    return <>{children}</>;
  } catch (error) {
    console.error("Error in admin layout:", error);
    return redirect("/dashboard");
  }
}