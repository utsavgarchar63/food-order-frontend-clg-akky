const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['dining', 'kitchen'],
    default: 'dining'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
galleryImageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
