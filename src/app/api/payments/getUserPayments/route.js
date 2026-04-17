import dbConnect from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import Payment from "@/app/models/payment";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const user = await getUserId();
  if (!user) {
    return NextResponse.json({ unauthorized: true }, { status: 401 });
  }

  try {
    const payments = await Payment.find({ user: user.userId })
      .sort({ createdAt: -1 })
      .populate("order", "_id status totalAmount createdAt");

    const formattedPayments = payments.map((payment) => ({
      paymentId: payment._id,
      method: payment.method,
      amount: payment.amount,
      status: payment.status,
      reviewStatus: payment.reviewStatus,
      paymentRef: payment.paymentRef,
      paymentProofUrl: payment.paymentProofUrl,
      gatewayDetails: payment.gatewayDetails,
      reviewNote: payment.reviewNote,
      reviewedAt: payment.reviewedAt,
      createdAt: payment.createdAt,
      order: payment.order
        ? {
            orderId: payment.order._id,
            status: payment.order.status,
            totalAmount: payment.order.totalAmount,
            createdAt: payment.order.createdAt,
          }
        : null,
    }));

    return NextResponse.json({ success: true, payments: formattedPayments });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch user payments", error: error.message },
      { status: 500 }
    );
  }
}