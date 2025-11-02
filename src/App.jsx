import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import FoodOrder from './pages/FoodOrder';
import Menu from './pages/Menu';
import Gallery from './pages/Gallery';
import TableReservation from './pages/TableReservation';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<FoodOrder />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/reserve" element={<TableReservation />} />
        <Route path="/table-reservation" element={<TableReservation />} />
        <Route path="/tableReservation" element={<TableReservation />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
