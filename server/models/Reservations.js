const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  date: String,   // or Date if you prefer
  time: String,
  persons: Number
}, {
  timestamps: true,
  collection: 'reservations' // <-- change this to your actual collection name
});

module.exports = mongoose.model('Reservations', reservationSchema);
