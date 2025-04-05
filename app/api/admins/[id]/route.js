import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils";
import { Admins } from "@/app/lib/models";
import mongoose from "mongoose";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  try {
    // Check authentication using cookies
    const adminId = cookies().get("auth-token")?.value;

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Verify requesting admin exists and has proper access
    const requestingAdmin = await Admins.findById(adminId);
    if (!requestingAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 401 });
    }

    // Get the requested admin data
    const { id } = params;
    console.log("Requested admin ID:", id);

    let admin;

    if (mongoose.Types.ObjectId.isValid(id)) {
      admin = await Admins.findById(id);
    } else {
      return NextResponse.json({ error: "Invalid admin ID format" }, { status: 400 });
    }

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    console.log("Found admin:", admin.username);

    // Process profile image path
    let profileImage = admin.profileImage;
    if (profileImage) {
      // If it's already a data URL format (from our saveProfileImage in production), keep it as is
      if (profileImage.startsWith('dataurl:')) {
        // No changes needed - the ProfileImage component will handle this format
      }
      // If it's already a full URL, leave it as is
      else if (profileImage.startsWith("http")) {
        // Just add cache busting
        profileImage = `${profileImage}${profileImage.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }
      // If it's already a path with /uploads/, just add cache busting
      else if (profileImage.startsWith("/uploads/")) {
        profileImage = `${profileImage}${profileImage.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }
      // Otherwise, assume it's just a filename and prepend the path
      else {
        const imageName = profileImage.split("/").pop();
        profileImage = `/uploads/${imageName || profileImage}?t=${Date.now()}`;
      }
    } else {
      // Default to noavatar.png if no image
      profileImage = `/noavatar.png?t=${Date.now()}`;
    }

    // Return the admin data
    return NextResponse.json({
      id: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      name: admin.name,
      profileImage: profileImage,
      role: admin.role || "data_encoder",
      accountLocked: admin.accountLocked || false,
      loginAttempts: admin.loginAttempts || 0,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    console.error("Error retrieving admin:", error);
    return NextResponse.json({
      error: "Failed to retrieve admin",
      details: error.message,
    }, { status: 500 });
  }
}