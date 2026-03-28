import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price must be a positive number"]
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
    trim: true
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    enum: {
     values: [
      "Laptops",
      "Laptops | Used",
      "Laptop Accessories",
      "Cameras | Drones",
      "Cartridges & Toners",
      "Casing",
      "Cooling Solutions",
      "Desktop Computers",
      "Gaming Consoles",
      "Gaming Products",
      "Graphic Cards",
      "Graphic Tablets",
      "Hard Drives",
      "Headsets | Headphones | Mic",
      "Keyboard",
      "LCD/LED Monitors",
      "Memory Cards",
      "Memory Module / RAM",
      "Motherboards",
      "Mouse",
      "Network Products",
      "Peripherals / Misc",
      "Power Supply",
      "Presenters",
      "Printers",
      "Processors",
      "Projectors",
      "Scanner",
      "Smart Watches",
      "Softwares",
      "Solid-State Drives (SSD)",
      "Speakers",
      "Tablet PC",
      "Tablet Accessories",
      "TV Devices | Streaming Media Players",
      "USB Flash Drives",
      "Used Products",
      "Other"
    ],
      message: "{VALUE} is not a valid category"
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, "Product stock is required"],
    min: [0, "Stock cannot be negative"],
    default: 0
  },
  displayImage: {
    type: String,
    trim: true,
    default: ""
  },
  images: [{
    type: String,
    required: [true, "At least one product image is required"]
  }]
}, { 
  timestamps: true, 
  versionKey: false 
});


productSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
