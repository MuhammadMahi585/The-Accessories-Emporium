import dbConnect from "@/app/lib/db";
import { getUserId } from "@/app/lib/getUserId";
import { NextResponse } from "next/server";

export async function POST(req) {
  await dbConnect();
  const user = await getUserId(req);
  if (!user)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    success: false,
    message: "Cash on Delivery is disabled. Use JazzCash, EasyPaisa, or Bank Transfer from checkout."
  }, { status: 400 });
}
