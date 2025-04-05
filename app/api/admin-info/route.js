import { cookies } from "next/headers";
import { connectToDB } from "@/app/lib/utils";
import { Admins } from "@/app/lib/models";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const adminId = cookies().get("auth-token")?.value;
    
    if (!adminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    await connectToDB();
    
    // Make sure to use lean() to get a plain object
    const admin = await Admins.findById(adminId).lean();
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    console.log("Admin from DB:", admin); // Debug log
    
    // Process profile image path
    let profileImage = admin.profileImage;
    if (profileImage) {
      // If it's already a data URL format (from our saveProfileImage in production), keep it as is
      if (profileImage.startsWith('dataurl:')) {
        // No changes needed - the ProfileImage component will handle this format
      }
      // If it's already a full URL, leave it as is
      else if (profileImage.startsWith('http')) {
        // Just add cache busting
        profileImage = `${profileImage}${profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`;
      }
      // If it's already a path with /uploads/, just add cache busting
      else if (profileImage.startsWith('/uploads/')) {
        profileImage = `${profileImage}${profileImage.includes('?') ? '&' : '?'}t=${Date.now()}`;
      }
      // Otherwise, assume it's just a filename and prepend the path
      else {
        const imageName = profileImage.split('/').pop();
        profileImage = `/uploads/${imageName || profileImage}?t=${Date.now()}`;
      }
    } else {
      // Default to noavatar.png if no image
      profileImage = `/noavatar.png?t=${Date.now()}`;
    }
    
    return NextResponse.json({
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name || admin.username,
      email: admin.email,
      profileImage: profileImage,
      role: admin.role // Return the role from DB
    });
  } catch (error) {
    console.error("Error fetching admin info:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}