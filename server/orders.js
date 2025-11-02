const express = require('express');
const router = express.Router();
const db = require('../db');

// POST - add new order
router.post('/', (req, res) => {
  const { name, phone, item, price } = req.body;

  const sql = 'INSERT INTO orders (name, phone, item, price) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, phone, item, price], (err, result) => {
    if (err) {
      console.error('Error inserting order:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(201).send('Order added');
  });
});

// GET - get all orders
router.get('/', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});

module.exports = router;
