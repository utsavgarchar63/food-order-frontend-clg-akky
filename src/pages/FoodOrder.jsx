import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FoodOrder.css';
import axios from 'axios';
import Breadcrumb from '../components/Breadcrumb';

const FoodOrder = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState({});
  const [order, setOrder] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentAddress: ''
  });





  useEffect(() => {
    const fetchMenu = () => {
      fetch('http://localhost:5000/menu')
        .then(res => res.json())
        .then(data => {
          const grouped = data.reduce((acc, item) => {
            acc[item.category] = acc[item.category] || [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setMenuItems(grouped);
        })
        .catch(err => console.error('Failed to fetch menu:', err));
    };


    fetchMenu();
    const interval = setInterval(fetchMenu, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleQuantityChange = (category, name, quantity) => {
    if (quantity < 0) return;
    setOrder(prev => {
      const updated = { ...prev };
      if (!updated[category]) updated[category] = {};
      if (quantity === 0) {
        delete updated[category][name];
        if (Object.keys(updated[category]).length === 0) delete updated[category];
      } else {
        updated[category][name] = quantity;
      }
      return updated;
    });
  };

  const totalItems = Object.values(order).reduce(
    (sum, cat) => sum + Object.values(cat).reduce((s, q) => s + q, 0),
    0
  );

  const handlePlaceOrder = () => {
    if (totalItems === 0) {
      setMessage({ type: 'error', text: 'Please add at least one item to order.' });
    } else {
      setShowForm(true);
    }
  };

  const handleAddItem = (category, name) => {
    const currentQty = order[category]?.[name] || 0;
    handleQuantityChange(category, name, currentQty + 1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, currentAddress } = formData;

    if (!name || /\d/.test(name)) {
      return setMessage({ type: 'error', text: 'Please enter a valid name without numbers.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setMessage({ type: 'error', text: 'Invalid email format.' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return setMessage({ type: 'error', text: 'Phone number must be 10 digits.' });
    }
    if (!currentAddress || /^[0-9]+$/.test(currentAddress)) {
      return setMessage({ type: 'error', text: 'Address must be valid and not numeric only.' });
    }

    const selectedItems = [];
    let totalPrice = 0;

    for (const category in order) {
      for (const itemName in order[category]) {
        const quantity = order[category][itemName];
        const menuItem = menuItems[category]?.find(item => item.name === itemName);
        if (menuItem) {
          selectedItems.push({
            name: itemName,
            quantity,
            price: menuItem.price,
            category
          });
          totalPrice += menuItem.price * quantity;
        }
      }
    }

    const orderData = {
      client_name: name,
      email,
      phone,
      address: currentAddress,
      menu: selectedItems,
      price: parseFloat(totalPrice.toFixed(2))
    };

    try {
      await axios.post('http://localhost:5000/order', orderData);
      setMessage({ type: 'success', text: 'Order placed successfully!' });
      setOrder({});
      setFormData({ name: '', email: '', phone: '', currentAddress: '' });
      setShowForm(false);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to place order. Please try again.' });
    }
  };

  const handleMessageOk = () => {
    if (message?.type === 'success') navigate('/');
    else setMessage(null);
  };

  return (
    <>
      <Breadcrumb style={{ color: "black", position: "absolute", left: "80px",top : "30px", "z-index": "9999" }} />

      <div className="food-order-page">
        <h1>ORDER DELICIOUS FOOD ONLINE</h1>
        <p>CHOOSE FROM A WIDE VARIETY OF OUR BEST DISHES.</p>

        <div className="menu-list">
          {Object.entries(menuItems).map(([category, items]) => (
            <div key={category} className="menu-category">
              <h2>{category}</h2>
              <div className="menu-item-box ">
                {items.map(({ id, name, price, image }) => (
                  <div key={id} className="menu-item">
                    <div className="item-info">
                      <img
                        src={`http://localhost:5000/images/${image}?t=${new Date().getTime()}`}
                        alt={name}
                        className="item-image"
                      />
                      <span className="item-name">{name}</span>
                      <br />
                      <span className="item-name">₹{price}</span>
                    </div>
                    <div className="item-actions">
                      <input
                        type="number"
                        min="0"
                        value={order[category]?.[name] || 0}
                        onChange={(e) =>
                          handleQuantityChange(category, name, parseInt(e.target.value) || 0)
                        }
                        className="quantity-input"
                      />
                      <button
                        onClick={() => handleAddItem(category, name)}
                        className="add-btn"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="place-order-btn" onClick={handlePlaceOrder}>
          Place Order ({totalItems} items)
        </button>
      </div>

      {/* Modal OUTSIDE food-order-page */}
      {showForm && (
        <div className="order-form-modal">
          <form className="order-form" onSubmit={handleSubmit}>
            <h2>Enter Your Details</h2>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleFormChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleFormChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleFormChange}
            />
            <input
              type="text"
              name="currentAddress"
              placeholder="Current Address"
              value={formData.currentAddress}
              onChange={handleFormChange}
            />
            <button type="submit">Submit</button>
          </form>
        </div>
      )}

      {message && (
        <>
          {/* Overlay to blur background */}
          <div className="message-overlay"></div>

          {/* Message box */}
          <div className={`message-box1 ${message.type}`}>
            <p>{message.text}</p>
            <button onClick={handleMessageOk}>OK</button>
          </div>
        </>
      )}

    </>
  );
};

export default FoodOrder;
