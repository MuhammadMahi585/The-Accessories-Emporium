import dbConnect from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import Payment from "@/app/models/payment";
import Product from "@/app/models/products";
import User from "@/app/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();

  const user = await getUserId();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      paymentMethod,
      transactionId = "",
      paymentProofUrl = "",
      mobileNumber = "",
      bankName = "",
      accountNumber = "",
      shippingAddress,
    } = await req.json();

    if (!["JazzCash", "EasyPaisa", "Bank"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: "This endpoint is for local payment submissions only." },
        { status: 400 }
      );
    }

    if (!transactionId.trim()) {
      return NextResponse.json(
        { success: false, message: `Transaction ID is required for ${paymentMethod}.` },
        { status: 400 }
      );
    }

    if (!paymentProofUrl.trim()) {
      return NextResponse.json(
        { success: false, message: `Payment proof is required for ${paymentMethod}.` },
        { status: 400 }
      );
    }

    if (["JazzCash", "EasyPaisa"].includes(paymentMethod) && !mobileNumber.trim()) {
      return NextResponse.json(
        { success: false, message: `${paymentMethod} mobile number is required.` },
        { status: 400 }
      );
    }

    if (paymentMethod === "Bank") {
      if (!bankName.trim()) {
        return NextResponse.json(
          { success: false, message: "Bank name is required for bank transfers." },
          { status: 400 }
        );
      }

      if (!accountNumber.trim()) {
        return NextResponse.json(
          { success: false, message: "Account number is required for bank transfers." },
          { status: 400 }
        );
      }
    }

    const customer = await User.findById(user.userId).populate("cart.product");

    if (!customer?.cart?.length) {
      return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    const cartSnapshot = [];
    let totalAmount = 0;

    for (const item of customer.cart) {
      const product = await Product.findById(item.product._id);

      if (!product || product.stock <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `${item.product.name} is currently out of stock. Please update your cart and try again.`,
          },
          { status: 400 }
        );
      }

      if (item.quantity > product.stock) {
        return NextResponse.json(
          {
            success: false,
            message: `${item.product.name} quantity is higher than current stock. Please adjust the cart before submitting payment.`,
          },
          { status: 400 }
        );
      }

      cartSnapshot.push({
        product: item.product._id,
        name: item.product.name,
        priceAtPurchase: item.product.price,
        quantity: item.quantity,
      });

      totalAmount += item.product.price * item.quantity;
    }

    const payment = await Payment.create({
      user: user.userId,
      method: paymentMethod,
      amount: totalAmount,
      status: "pending",
      reviewStatus: "pending",
      paymentProofUrl,
      paymentRef: transactionId,
      shippingAddress,
      cartSnapshot,
      gatewayDetails: {
        transactionId,
        mobileNumber: ["JazzCash", "EasyPaisa"].includes(paymentMethod) ? mobileNumber : "",
        bankName: paymentMethod === "Bank" ? bankName : "",
        accountNumber: paymentMethod === "Bank" ? accountNumber : "",
      },
      deviceInfo: req.headers.get("user-agent") || "",
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
    });

    await User.findByIdAndUpdate(user.userId, { $set: { cart: [] } });

    return NextResponse.json({
      success: true,
      message: `${paymentMethod} payment submitted for review.`,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
