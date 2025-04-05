import { NextResponse } from "next/server";
import { connectToDB } from "../../lib/utils";
import { Admins } from "../../lib/models";
import { sendOtpEmail } from "../../lib/emailUtils";
import crypto from "crypto";

export async function POST(req) {
  try {
    console.log("Forgot password API hit");
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ 
        success: false,
        message: 'Email is required' 
      }, { status: 400 });
    }

    // Connect to database
    await connectToDB();

    // Find admin by email
    const admin = await Admins.findOne({ email });
    if (!admin) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({ 
        success: true,
        message: 'If this email exists, we sent an OTP' 
      }, { status: 200 });
    }

    // Generate OTP - 6 digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration to 5 minutes from now
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);
    
    // Hash the OTP before storing
    const hashedOtp = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
    
    // Update admin with OTP info
    admin.resetPasswordOtp = hashedOtp;
    admin.resetPasswordExpires = otpExpiry;
    await admin.save();
    
    // Send OTP email
    await sendOtpEmail(email, otp);
    
    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully' 
    }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to process request' 
    }, { status: 500 });
  }
}