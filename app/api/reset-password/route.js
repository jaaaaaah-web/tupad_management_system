import { NextResponse } from "next/server";
import { connectToDB } from "../../lib/utils";
import { Admins } from "../../lib/models";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ 
        success: false,
        message: 'Token and password are required' 
      }, { status: 400 });
    }

    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ 
        success: false,
        message: 'Password does not meet requirements' 
      }, { status: 400 });
    }

    // Verify token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || process.env.AUTH_SECRET);
    } catch (error) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid or expired token' 
      }, { status: 400 });
    }

    // Connect to database
    await connectToDB();

    // Find admin
    const admin = await Admins.findById(decodedToken.adminId);
    if (!admin) {
      return NextResponse.json({ 
        success: false,
        message: 'Admin not found' 
      }, { status: 404 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update admin's password and clear reset fields
    admin.password = hashedPassword;
    admin.resetPasswordOtp = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to reset password' 
    }, { status: 500 });
  }
}