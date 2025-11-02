const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  client_name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  menu: [{ name: String, price: Number, quantity: Number }],
  price: { type: Number, required: true },
  status: { type: String, default: "placed" }, // placed, delivered, cancelled
  reason: { type: String, default: "" }, // cancellation reason
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
