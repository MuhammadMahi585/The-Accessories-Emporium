import dbConnect from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import Payment from "@/app/models/payment";
import User from "@/app/models/user";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await dbConnect();

  const user = await getUserId();
  if (!user || user.type !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentId, reviewNote = "Rejected by admin" } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "Payment ID is required" }, { status: 400 });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    if (payment.reviewStatus !== "pending") {
      return NextResponse.json(
        { success: false, message: "This payment has already been reviewed" },
        { status: 400 }
      );
    }

    await Payment.findByIdAndUpdate(paymentId, {
      status: "failed",
      reviewStatus: "rejected",
      reviewedAt: new Date(),
      reviewNote,
    });

    await User.findByIdAndUpdate(payment.user, {
      $set: {
        cart: payment.cartSnapshot.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      },
    });

    return NextResponse.json({ success: true, message: "Payment rejected and cart restored" });
  } catch (error) {
    console.error("Reject payment error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
