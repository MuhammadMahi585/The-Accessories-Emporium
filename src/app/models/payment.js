import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orders",
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User reference is required"]
  },
  method: {
    type: String,
    enum: ["EasyPaisa", "JazzCash", "Bank"],
    required: [true, "Payment method is required"]
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [1, "Amount cannot be less than 1 PKR"]
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  reviewStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "not_required"],
    default: "pending"
  },
  paymentProofUrl: {
    type: String,
    default: ""
  },
  paymentRef: {
    type: String,
    default: ""
  },
  shippingAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: "Pakistan" }
  },
  cartSnapshot: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String },
    priceAtPurchase: { type: Number },
    quantity: { type: Number }
  }],
  // Gateway-specific fields
  gatewayDetails: {
    transactionId: String,          // JazzCash/EasyPaisa transaction ID
    accountNumber: String,          // Last 4 digits for cards/bank transfers
    mobileNumber: {                 // For JazzCash/EasyPaisa
      type: String,
      validate: {
        validator: (v) => /^03\d{9}$/.test(v), // Pakistani mobile format
        message: "Invalid Pakistani mobile number"
      }
    },
    bankName: String               // For bank transfers (HBL, UBL, etc.)
  },
  // Security & Verification
  verification: {
    otp: String,                   // SMS OTP for mobile payments
    verifiedAt: Date
  },
  // Audit Log
  ipAddress: String,               // Capture payer's IP
  deviceInfo: String,              // User agent/browser
  gatewayResponse: Object,          // Raw response from payment provider
  reviewedAt: Date,
  reviewNote: String
}, { 
  timestamps: true 
});

// Add indexes for faster queries
paymentSchema.index({ order: 1 });
paymentSchema.index({ paymentRef: 1 }, { unique: true, sparse: true });
paymentSchema.index({ "gatewayDetails.transactionId": 1 }, { unique: true, sparse: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;