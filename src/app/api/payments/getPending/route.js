import dbConnect from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import Payment from "@/app/models/payment";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  const user = await getUserId();
  if (!user || user.type !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payments = await Payment.find({ reviewStatus: "pending" })
      .sort({ createdAt: -1 })
      .populate("user", "name email number");

    const formattedPayments = payments.map((payment) => ({
      paymentId: payment._id,
      method: payment.method,
      amount: payment.amount,
      paymentRef: payment.paymentRef,
      paymentProofUrl: payment.paymentProofUrl,
      reviewStatus: payment.reviewStatus,
      createdAt: payment.createdAt,
      shippingAddress: payment.shippingAddress,
      gatewayDetails: payment.gatewayDetails,
      cartSnapshot: payment.cartSnapshot.map((item) => ({
        productId: item.product,
        productName: item.name,
        quantity: item.quantity,
        price: item.priceAtPurchase,
      })),
      user: {
        name: payment.user?.name,
        email: payment.user?.email,
        number: payment.user?.number,
      },
    }));

    return NextResponse.json({ success: true, payments: formattedPayments });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments", error: error.message },
      { status: 500 }
    );
  }
}
