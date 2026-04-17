import crypto from "crypto";
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import User from "@/app/models/user";
import { createMailer } from "@/app/lib/mailer";

export const runtime = "nodejs";

export async function POST(req) {
  await dbConnect();

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    // Always return success-like response to avoid email enumeration.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If this email exists, a reset link has been generated.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    const appUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const resetUrl = `${appUrl}/components/authentication/reset-password?token=${rawToken}`;

    const mailer = createMailer();
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.email,
      subject: "Reset your The Accessories Emporium password",
      text: `We received a request to reset your password. Use this link within 15 minutes: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2 style="margin-bottom: 12px;">Reset your password</h2>
          <p>We received a request to reset the password for your The Accessories Emporium account.</p>
          <p><a href="${resetUrl}" target="_blank" rel="noreferrer">Click here to reset your password</a></p>
          <p>This link expires in 15 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "If this email exists, a reset link has been sent to your inbox.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to generate reset link", details: error.message },
      { status: 500 }
    );
  }
}
