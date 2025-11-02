const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: null }, // stored filename, e.g. "1723642854567.jpg"
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
