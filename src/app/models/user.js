import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password too short"]
  },
  type: {
    type: String,
    required: true,
    enum: ["customer", "admin"],
    default: "customer"
  },
  number: {
    type: String,        // Phone numbers are better stored as String
    required: true,
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product" 
    },
    quantity:{ type:Number,
    required:true}
  }],
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Orders"
  }],
  addresses: [{
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, default: "Pakistan" },
  isDefault: { type: Boolean, default: true }
}],
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;