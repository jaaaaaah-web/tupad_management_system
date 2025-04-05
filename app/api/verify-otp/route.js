import { NextResponse } from "next/server";
import { connectToDB } from "../../lib/utils";
import { Admins } from "../../lib/models";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ 
        success: false,
        message: 'Email and OTP are required' 
      }, { status: 400 });
    }

    // Connect to database
    await connectToDB();

    // Find admin by email
    const admin = await Admins.findOne({ email });
    if (!admin) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid OTP' 
      }, { status: 400 });
    }

    // Check if OTP exists
    if (!admin.resetPasswordOtp || !admin.resetPasswordExpires) {
      return NextResponse.json({ 
        success: false,
        message: 'No OTP request found. Please request a new OTP.' 
      }, { status: 400 });
    }

    // Check if OTP is expired
    if (admin.resetPasswordExpires < new Date()) {
      return NextResponse.json({ 
        success: false,
        message: 'OTP has expired' 
      }, { status: 400 });
    }

    // Hash the provided OTP and compare
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    if (admin.resetPasswordOtp !== hashedOtp) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid OTP' 
      }, { status: 400 });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { adminId: admin._id.toString() },
      process.env.JWT_SECRET || process.env.AUTH_SECRET,
      { expiresIn: '15m' }
    );

    return NextResponse.json({ 
      success: true,
      message: 'OTP verified successfully',
      token: resetToken
    }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to verify OTP' 
    }, { status: 500 });
  }
}