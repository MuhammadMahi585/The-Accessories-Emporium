// File: /app/api/products/editProduct/route.js or route.ts (depending on your setup)

import Product from "@/app/models/products";
import dbConnect from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req) {
  await dbConnect();
  
  try {
    const { id, price, stock, displayImage } = await req.json();

    if (!id || price == null || stock == null) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData = { price, stock };

    if (displayImage !== undefined) {
      updateData.displayImage = displayImage;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
