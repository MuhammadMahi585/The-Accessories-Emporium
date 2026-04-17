import dbConnect from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import Orders from "@/app/models/orders";
import Payment from "@/app/models/payment";
import Product from "@/app/models/products";
import User from "@/app/models/user";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await dbConnect();

  const user = await getUserId();
  if (!user || user.type !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentId } = await req.json();

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

    const orderItems = [];

    for (const item of payment.cartSnapshot) {
      const product = await Product.findById(item.product);

      if (!product || product.stock < item.quantity) {
        await Payment.findByIdAndUpdate(paymentId, {
          status: "failed",
          reviewStatus: "rejected",
          reviewedAt: new Date(),
          reviewNote: "Stock changed before approval",
        });

        await User.findByIdAndUpdate(payment.user, {
          $set: {
            cart: payment.cartSnapshot.map((snapshotItem) => ({
              product: snapshotItem.product,
              quantity: snapshotItem.quantity,
            })),
          },
        });

        return NextResponse.json(
          {
            success: false,
            message: `${item.name} could not be approved because stock changed.`,
          },
          { status: 400 }
        );
      }

      orderItems.push({
        product: item.product,
        name: item.name,
        priceAtPurchase: item.priceAtPurchase,
        quantity: item.quantity,
      });
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);

    const order = await Orders.create({
      user: payment.user,
      items: orderItems,
      shippingAddress: payment.shippingAddress,
      totalAmount,
      paymentMethod: payment.method,
      paymentStatus: "completed",
      paymentRef: payment.paymentRef,
      paymentProofUrl: payment.paymentProofUrl,
      paymentReviewedAt: new Date(),
      paymentId: payment._id,
      status: "processing",
    });

    await Promise.all(
      orderItems.map((item) => Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } }))
    );

    await User.findByIdAndUpdate(payment.user, {
      $push: { orders: order._id },
      $set: { cart: [] },
    });

    await Payment.findByIdAndUpdate(paymentId, {
      order: order._id,
      status: "completed",
      reviewStatus: "approved",
      reviewedAt: new Date(),
      reviewNote: "Approved by admin",
    });

    return NextResponse.json({ success: true, message: "Payment approved and order created", orderId: order._id });
  } catch (error) {
    console.error("Approve payment error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
