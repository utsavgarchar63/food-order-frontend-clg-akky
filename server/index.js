const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/orders');
const Reservations = require('./models/Reservations');
const Admin = require('./models/admin');
const User = require("./models/User");
const Staff = require("./models/Staff");
const GalleryImage = require("./models/GalleryImage");

const app = express();
const port = 5000;
const JWT_SECRET = "supersecretkey"; // in production, use env variable

// Middleware
app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "images")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/food_order_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');
  await Order.deleteMany({});
  await Reservations.deleteMany({});
  console.log('🧹 Cleared all orders and reservations');
}).catch(err => console.error('❌ MongoDB connection error:', err));

/* ==============================
   USER AUTH ROUTES
============================== */

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const emailLower = email.toLowerCase();
    // Check using lowercase email
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) return res.status(400).json({ msg: "Email already exists" });

    const newUser = new User({ name, email: emailLower, password });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ msg: "Login successful", token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ==============================
   ADMIN AUTH ROUTES
============================== */

// Register admin
app.post("/api/admin/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ msg: "Username already exists" });

    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Login admin
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    res.json({ msg: "Admin login successful", admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ==============================
   MENU ROUTES
============================== */

// Get all menu items
app.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Add menu item
app.post('/menu', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const image = req.file ? req.file.filename : null;
    const newItem = new MenuItem({ name, price, category, image });
    await newItem.save();
    res.status(201).json({ message: 'Menu item added', item: newItem });
  } catch (err) {
    res.status(500).json({ error: 'Add item failed' });
  }
});

// Update menu item
app.put("/menu/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, price, category } = req.body;

  try {
    const updateData = { name, price, category };
    if (req.file) updateData.image = req.file.filename;
    const updated = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: "Item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete menu item
app.delete("/menu/:id", async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.image) await fs.unlink(path.join(__dirname, "images", item.image));
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ==============================
   ORDER ROUTES
============================== */

app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ time_created: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/order', async (req, res) => {
  try {
    const { client_name, email, phone, address, menu, price } = req.body;
    const newOrder = new Order({ client_name, email, phone, address, menu, price });
    await newOrder.save();
    res.json({ message: "Order placed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
// Cancel order with reason
app.put("/orders/:id", async (req, res) => {
  try {
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    if (status === "cancelled") order.reason = reason || "No reason provided";

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ==============================
   RESERVATIONS
============================== */

app.post('/reservations', async (req, res) => {
  try {
    const reservation = new Reservations(req.body);
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/reservations', async (req, res) => {
  try {
    const allReservations = await Reservations.find().sort({ date: 1, time: 1 });
    res.json(allReservations);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.delete('/reservations/:id', async (req, res) => {
  try {
    const deleted = await Reservations.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Reservation not found" });
    res.json({ message: "Reservation cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ==============================
   GALLERY ROUTES
============================== */

// Get all staff members
app.get('/api/gallery/staff', async (req, res) => {
  try {
    const staff = await Staff.find().sort({ category: 1, name: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// Add new staff member
app.post('/api/gallery/staff', upload.single('image'), async (req, res) => {
  try {
    const { name, role, category, description } = req.body;
    const image = req.file ? req.file.filename : null;
    
    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const newStaff = new Staff({ name, role, category, description, image });
    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add staff member' });
  }
});

// Update staff member
app.put('/api/gallery/staff/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, category, description } = req.body;
    
    const updateData = { name, role, category, description };
    if (req.file) {
      // Delete old image if updating with new one
      const existingStaff = await Staff.findById(id);
      if (existingStaff && existingStaff.image) {
        try {
          await fs.unlink(path.join(__dirname, "images", existingStaff.image));
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      updateData.image = req.file.filename;
    }

    const updatedStaff = await Staff.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedStaff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(updatedStaff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Delete staff member
app.delete('/api/gallery/staff/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Delete the image file
    if (staff.image) {
      try {
        await fs.unlink(path.join(__dirname, "images", staff.image));
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// Get dining experience images
app.get('/api/gallery/dining', async (req, res) => {
  try {
    const images = await GalleryImage.find({ category: 'dining' }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dining images' });
  }
});

// Get kitchen images
app.get('/api/gallery/kitchen', async (req, res) => {
  try {
    const images = await GalleryImage.find({ category: 'kitchen' }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kitchen images' });
  }
});

// Add new gallery image
app.post('/api/gallery/images', upload.single('image'), async (req, res) => {
  try {
    const { category, description } = req.body;
    const filename = req.file ? req.file.filename : null;
    
    if (!filename) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const newImage = new GalleryImage({ filename, category, description });
    await newImage.save();
    res.status(201).json(newImage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Delete gallery image
app.delete('/api/gallery/images/:id', async (req, res) => {
  try {
    const { category } = req.query;
    const image = await GalleryImage.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete the image file
    if (image.filename) {
      try {
        await fs.unlink(path.join(__dirname, "images", image.filename));
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    await GalleryImage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Admin Dashboard API. Please use the appropriate endpoints.');
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
