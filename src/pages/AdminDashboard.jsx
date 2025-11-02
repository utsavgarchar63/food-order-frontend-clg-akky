import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import axios from "axios";
import CountUp from "react-countup";
import GalleryManagement from './GalleryManagement'; // Import the new GalleryManagement component

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin", // in production, store hashed passwords!
};



const AdminDashboard = () => {
   const [activeTab, setActiveTab] = useState("home");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [Reservations, setReservations] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", image: null });
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [orderFilter, setOrderFilter] = useState("placed");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cancelModal, setCancelModal] = useState({ show: false, order: null, reason: "" });


  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    fetchReservations();
  }, []);

  // 🔹 Keep checking new orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchMenuItems();
      fetchReservations();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await axios.get("http://localhost:5000/menu");
      setMenuItems(res.data);
      if (res.data.length > 0) {
        setSelectedCategory((prev) => prev || res.data[0].category);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/Reservations");
      setReservations(res.data);
    } catch (error) {
      console.error("Error fetching Reservation:", error);
    }
  };

  const handleOrderAction = async (order, action) => {
  try {
    const res = await fetch(`http://localhost:5000/orders/${order._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action === "deliver" ? "delivered" : "cancelled" }),
    });
    const data = await res.json();
    if (res.ok) {
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o._id === order._id ? { ...o, status: data.status } : o))
      );
    } else {
      alert(data.error || "Failed to update order");
    }
  } catch (err) {
    console.error(err);
  }
};




    // Submit cancel with reason to backend
// Cancel modal
const handleCancelWithReason = (order) => {
  setCancelModal({ show: true, order, reason: "" });
};

const handleSubmitCancel = async () => {
  if (!cancelModal.reason.trim()) {
    alert("Please enter a reason for cancellation");
    return;
  }

  try {
    const res = await axios.put(
      `http://localhost:5000/orders/${cancelModal.order._id}`,
      { status: "cancelled", reason: cancelModal.reason }
    );

    if (res.status === 200) {
      const updatedOrder = res.data;
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      setCancelModal({ show: false, order: null, reason: "" });
      document.body.style.overflow = 'auto';
    }
  } catch (err) {
    console.error(err);
    alert("Failed to cancel order");
  }
};





  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "placed") return order.status === "placed" || !order.status;
    if (orderFilter === "delivered") return order.status === "delivered";
    if (orderFilter === "cancelled") return order.status === "cancelled";
    return true;
  });

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !newItem.name || !newItem.price || !newItem.image) return;
    try {
      const formData = new FormData();
      formData.append("category", newCategory);
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      formData.append("image", newItem.image);

      await axios.post("http://localhost:5000/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewCategory("");
      setNewItem({ name: "", price: "", category: "", image: null });
      fetchMenuItems();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.category || !newItem.image) return;
    try {
      const formData = new FormData();
      formData.append("category", newItem.category);
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      formData.append("image", newItem.image);

      await axios.post("http://localhost:5000/menu", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewItem({ name: "", price: "", category: "", image: null });
      fetchMenuItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEditItem = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editingItem.name);
      formData.append("price", editingItem.price);
      formData.append("category", editingItem.category);
      if (editingItem.image instanceof File) formData.append("image", editingItem.image);

      await axios.put(`http://localhost:5000/menu/${editingItem._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Item updated successfully!");
      setEditingItem(null);
      fetchMenuItems();
    } catch (err) {
      console.error("❌ Failed to update item:", err.response?.data || err);
      alert("Update failed: " + (err.response?.data?.details || "server error"));
    }
  };

  const handleDeleteItem = async (item) => {
    try {
      setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
      await axios.delete(`http://localhost:5000/menu/${encodeURIComponent(item._id)}`);
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error);
      alert(error.response?.data?.error || "Delete failed");
      fetchMenuItems();
    }
  };

  const handleCancelReservations = async (resv) => {
    if (!window.confirm(`Cancel reservations for ${resv.name}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/Reservations/${resv._id}`);
      setReservations((prev) => prev.filter((r) => r._id !== resv._id));
    } catch (err) {
      console.error("Failed to cancel Reservations:", err);
      alert("Cancel failed");
    }
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];

  // --- HOME SECTION VARIABLES ---
  const totalOrders = orders.length;
  const totalMenuItems = menuItems.length;
  const pendingOrders = orders.filter((o) => !o.status || o.status === "placed").length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysReservations = Reservations.filter((r) => r.date === today);

  const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const recentReservations = [...Reservations].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  

  // --- TOP CUSTOMERS ---
  const topCustomers = orders.reduce((acc, order) => {
    const existing = acc.find((c) => c.client_name === order.client_name);
    if (existing) {
      existing.count += 1;
      existing.lastOrder = order.createdAt;
    } else {
      acc.push({ client_name: order.client_name, count: 1, lastOrder: order.createdAt });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count).slice(0, 3);

  // --- LOGIN HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setLoggedIn(true);
      localStorage.setItem("adminLoggedIn", "true"); // persist login
    } else {
      alert("Incorrect username or password!");
    }
  };

  // --- CHECK LOGIN STATUS ON LOAD ---
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setLoggedIn(true);
    }
  }, []);

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setLoggedIn(false);
    setUsername("");
    setPassword("");
  };

  if (!loggedIn) {
    return (
      <div className="login-page">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    );
  }


  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="logo">Vincent Restaurant</div>
        <nav>
          <ul>
            <li className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Home</li>
            <li className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Orders</li>
            <li className={activeTab === "menu" ? "active" : ""} onClick={() => setActiveTab("menu")}>Menu</li>
            <li className={activeTab === "Reservations" ? "active" : ""} onClick={() => setActiveTab("Reservations")}>Reservations</li>
            <li className={activeTab === "galleryManagement" ? "active" : ""} onClick={() => setActiveTab("galleryManagement")}>Gallery Management</li>
             <li onClick={handleLogout}>Logout</li>
          </ul>
        </nav>
      </aside>

      <main className="content">
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>

        {/* --- HOME TAB --- */}
        {activeTab === "home" && (
          <div className="home-tab">
            {/* Stats Cards with Animated Counter */}
            <div className="stats-cards">
              <div className="card blue">
                <h3>Total Menu Items</h3>
                <p><CountUp end={totalMenuItems} duration={1.5} /></p>
              </div>
              <div className="card green">
                <h3>Total Orders</h3>
                <p><CountUp end={totalOrders} duration={1.5} /></p>
              </div>
              <div className="card yellow">
                <h3>Pending Orders</h3>
                <p><CountUp end={pendingOrders} duration={1.5} /></p>
              </div>
              <div className="card purple">
                <h3>Reservations Today</h3>
                <p><CountUp end={Reservations.length} duration={1.5} /></p>
              </div>
            </div>

            
            {/* Recent Orders */}
            <div className="recent-section">
              <h2>Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p>No recent orders.</p>
              ) : (
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>contact no</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o._id}>
                        <td>{o.client_name}</td>
                        <td>{o.status || "Placed"}</td>
                        <td>₹{o.price}</td>
                        <td>{o.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Recent Reservations */}
            <div className="recent-section">
              <h2>Recent Reservations</h2>
              {recentReservations.length === 0 ? (
                <p>No recent reservations.</p>
              ) : (
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReservations.map((r) => (
                      <tr key={r._id}>
                        <td>{r.name}</td>
                        <td>{r.date}</td>
                        <td>{r.time}</td>
                        <td>{r.persons}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
              <div className="orders-container">
                {/* Filter Buttons */}
                <div className="order-filters">
                  <button
                    className={orderFilter === "placed" ? "active" : ""}
                    onClick={() => setOrderFilter("placed")}
                  >
                    Placed Orders
                  </button>
                  <button
                    className={orderFilter === "delivered" ? "active" : ""}
                    onClick={() => setOrderFilter("delivered")}
                  >
                    Delivered Orders
                  </button>
                  <button
                    className={orderFilter === "cancelled" ? "active" : ""}
                    onClick={() => setOrderFilter("cancelled")}
                  >
                    Cancelled Orders
                  </button>
                </div>

                {filteredOrders.length === 0 ? (
                  <p className="no-orders">No orders found.</p>
                ) : (
                  <div className="orders-list">
                    {filteredOrders.map((o, index) => (
                      <div className={`order-card ${o.status}`} key={index}>
                        <div className="order-header">
                          <h2 className="order-title">{o.client_name}'s Order</h2>
                          <span className="order-status">{o.status || "PLACED"}</span>
                        </div>

                        <div className="order-details">
                          <p><strong>Client:</strong> {o.client_name || "N/A"}</p>
                          <p><strong>Email:</strong> {o.email || "N/A"}</p>
                          <p><strong>Phone:</strong> {o.phone || "N/A"}</p>
                          <p><strong>Address:</strong> {o.address || "N/A"}</p>
                          <p><strong>Total Price:</strong> ₹{o.price || 0}</p>
                        </div>

                        <div className="order-items">
                          <strong>Items:</strong>
                          <ul>
                            {o.menu && o.menu.length > 0 ? (
                              o.menu.map((item, i) => (
                                <li key={i}>
                                  {item.name || "Unnamed"} – ₹{item.price || 0} × {item.quantity || 1}
                                </li>
                              ))
                            ) : (
                              <li>No items</li>
                            )}
                          </ul>
                        </div>

                        {o.status === "placed" && (
                          <div className="order-actions">
                            <button onClick={() => handleOrderAction(o, "deliver")} className="deliver-btn">Deliver</button>
                            <button onClick={() => handleCancelWithReason(o)} className="cancel-btn">Cancel</button>
                          </div>
                        )}
                      {o.status === "cancelled" && (
                      <p><strong>Cancel Reason:</strong> {o.reason || "No reason provided"}</p>
                    )}

                    {cancelModal.show && (
                      <div className="message-overlay">
                        <div className="message-box">
                          <h3>Reason for Cancel Order</h3>
                          <textarea
                            value={cancelModal.reason}
                            onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                            placeholder="Enter reason..."
                          />
                          <div>
                            <button onClick={handleSubmitCancel}>Submit</button>
                            <button onClick={() => setCancelModal({ show: false, order: null, reason: "" })}>
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

            </div>
          ))}
        </div>
      )} 
      </div>
      )}


        {/* Menu Tab */}
        {activeTab === "menu" && (
          <div className="menu-tab">
            <h2>Manage Menu</h2>

            {/* Add New Category */}
            <div className="form-section">
              <h3>Add New Category</h3>
              <input type="text" placeholder="Category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
              <input type="text" placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
              <input type="file" onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })} />
              <button onClick={handleAddCategory}>Add Category</button>
            </div>
            <br />
            {/* Add New Item to Existing Category */}
            <div className="form-section">
              <h3>Add Item to Existing Category</h3>
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input type="text" placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              <input type="number" placeholder="Price" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
              <input type="file" onChange={(e) => setNewItem({ ...newItem, image: e.target.files[0] })} />
              <button onClick={handleAddItem}>Add Item</button>
            </div>
            <br />
            <br />
            {/* Category Tabs */}
            <div className="category-tabs">
              {categories.map((cat) => (
                <button key={cat} className={selectedCategory === cat ? "active" : ""} onClick={() => setSelectedCategory(cat)}>
                  {cat} ({menuItems.filter((i) => i.category === cat).length} items)
                </button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="menu-items">
              {menuItems
                .filter((item) => item.category === selectedCategory)
                .map((item) => (
                  <div key={item._id} className="menu-card">
                    <img
                      className="menu-image"
                      src={`http://localhost:5000/images/${item.image}?t=${Date.now()}`}
                      alt={item.name}
                      style={{ width: "100px", height: "100px", objectFit: "cover" }}
                    />

                    <div className="menu-info">
                      <h4>{item.name}</h4>
                      <p>₹{item.price}</p>
                    </div>

                    <div className="menu-actions">
                      <button onClick={() => setEditingItem(item)} className="edit-btn">Edit</button>
                      <button onClick={() => setConfirmDelete(item)} className="delete-btn">Delete</button>
                    </div>
                  </div>
                ))}

              {/* Confirm Delete Modal */}
              {confirmDelete && (
                <div className="confirm-overlay fade-in">
                  <div className="confirm-box slide-up">
                    <p>
                      Confirm delete&nbsp;
                      <strong>{confirmDelete.name}</strong>?
                    </p>
                    <div className="confirm-actions">
                      <button
                        className="confirm-btn"
                        onClick={() => {
                          handleDeleteItem(confirmDelete);
                          setConfirmDelete(null);
                        }}
                      >
                        Confirm
                      </button>
                      <button className="cancel-btn" onClick={() => setConfirmDelete(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Form */}
            {editingItem && (
              <div className="edit-form">
                <h3>Edit Item</h3>
                <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} />
                <input type="number" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })} />
                <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input type="file" onChange={(e) => setEditingItem({ ...editingItem, image: e.target.files[0] })} />
                <button onClick={handleEditItem}>Save</button>
                <button onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            )}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === "Reservations" && (
          <div className="Reservations-container">
            {Reservations.length === 0 ? (
              <p className="no-Reservations">No Reservations found.</p>
            ) : (
              <div className="reservation-list">
                {Reservations.map((r, idx) => (
                  <div className="Reservations-card" key={idx}>
                    <h3>{r.name}'s Reservations</h3>
                    <p><strong>Email:</strong> {r.email}</p>
                    <p><strong>Phone:</strong> {r.phone}</p>
                    <p><strong>Guests:</strong> {r.persons}</p>
                    <p><strong>Date:</strong> {r.date}</p>
                    <p><strong>Time:</strong> {r.time}</p>
                    <button className="cancel-reservation" onClick={() => handleCancelReservations(r)}>Cancel Reservation</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gallery Management Tab */}
        {activeTab === "galleryManagement" && (
          <GalleryManagement />
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
