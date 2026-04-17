import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import User from "@/app/models/user";

export async function POST(req) {
  await dbConnect();

  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Token, password and confirm password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Reset token is invalid or has expired" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return NextResponse.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to reset password", details: error.message },
      { status: 500 }
    );
  }
}
