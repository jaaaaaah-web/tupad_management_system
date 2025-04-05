import { cookies } from "next/headers";
import { connectToDB } from "./utils";
import { Admins } from "./models";

export async function getCurrentUser() {
  try {
    const adminId = cookies().get("auth-token")?.value;
    
    if (!adminId) {
      return null;
    }
    
    await connectToDB();
    const user = await Admins.findById(adminId);
    
    if (!user) {
      return null;
    }
    
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role || 'data_encoder',
      profileImage: user.profileImage
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export function isSystemAdmin(user) {
  return user?.role === 'system_admin';
}