import React, { useState } from 'react';
import './Menu.css';

const menuItems = [
  { category: 'Pizzas', description: 'Tasty Exotic Pizzas', items: [
    { name: 'Margherita', description: 'Classic margherita pizza with tomato sauce and mozzarella', rating: 4.5, reviews: 548, image: require('../images/margrerita.jpg') },
    { name: 'Pepperoni', description: 'Spicy pepperoni with mozzarella cheese', rating: 4.5, reviews: 548, image: require('../images/PEPORONNI.jpg') },
    { name: 'Veggie Supreme', description: 'Loaded with fresh vegetables', rating: 4.5, reviews: 548, image: require('../images/Veggie Supreme.jpg') },
    { name: '9 Cheese', description: 'Nine cheese blend pizza', rating: 4.5, reviews: 548, image: require('../images/9cheesee.jpg') },
  ]},
  { category: 'Coffee', description: 'Freshly brewed coffee', items: [
    { name: 'Espresso', description: 'Strong and bold espresso', rating: 4.5, reviews: 548, image: require('../images/Espresso.jpg') },
    { name: 'Cappuccino', description: 'Creamy cappuccino with foam', rating: 4.5, reviews: 548, image: require('../images/Cappuccino.jpg') },
  ]},
  { category: 'Garlic Bread', description: 'Delicious garlic breads', items: [
    { name: 'Classic Garlic Bread', description: 'Freshly baked garlic bread', rating: 4.5, reviews: 548, image: require('../images/garlicbraed1.jpg') },
    { name: 'Cheesy Garlic Bread', description: 'Garlic bread with melted cheese', rating: 4.5, reviews: 548, image: require('../images/periperigbread.jpg') },
  ]},
  { category: 'Others', description: 'Other delicious items', items: [
    { name: 'Soft Drink', description: 'Refreshing soft drink', rating: 4.5, reviews: 548, image: require('../images/cocacola.jpg') },
    { name: 'Salad', description: 'Fresh garden salad', rating: 4.5, reviews: 548, image: require('../images/salad-4977372_1280.jpg') },
  ]},
  { category: 'Pasta', description: 'Delicious pasta dishes', items: [
    { name: 'Spaghetti Carbonara', description: 'Classic spaghetti carbonara', rating: 4.5, reviews: 548, image: require('../images/Fettuccine Alfredo.jpg') },
    { name: 'Penne Arrabbiata', description: 'Spicy penne arrabbiata', rating: 4.5, reviews: 548, image: require('../images/Penne Arrabbiata.jpg') },
    { name: 'Fettuccine Alfredo', description: 'Creamy fettuccine alfredo', rating: 4.5, reviews: 548, image: require('../images/Fettuccine Alfredo.jpg') },
    { name: 'Lasagna', description: 'Hearty lasagna', rating: 4.5, reviews: 548, image: require('../images/Lasagna.jpg') },
  ]},
  { category: 'Drinks', description: 'Refreshing drinks', items: [
    { name: 'Coca Cola', description: 'Classic Coca Cola', rating: 4.5, reviews: 548, image: require('../images/cocacola.jpg') },
    { name: 'Orange Juice', description: 'Fresh orange juice', rating: 4.5, reviews: 548, image: require('../images/fresh-orange-juice-1614822_1280.jpg') },
    { name: 'Lemonade', description: 'Refreshing lemonade', rating: 4.5, reviews: 548, image: require('../images/lemonade-6668438_1280.jpg') },
    { name: 'Iced Tea', description: 'Cool iced tea', rating: 4.5, reviews: 548, image: require('../images/iced-tea-7125274_1280.jpg') },
  ]},
  { category: 'Traditional Items', description: 'Traditional Italian items', items: [
    { name: 'Bruschetta', description: 'Italian bruschetta', rating: 4.5, reviews: 548, image: require('../images/Bruschetta.jpg') },
    { name: 'Caprese Salad', description: 'Fresh caprese salad', rating: 4.5, reviews: 548, image: require('../images/Cappuccino.jpg') },
    { name: 'Arancini', description: 'Crispy arancini', rating: 4.5, reviews: 548, image: require('../images/i91870-arancini.jpeg') },
    { name: 'Polenta', description: 'Creamy polenta', rating: 4.5, reviews: 548, image: require('../images/polenta.jpg') },
  ]},
  { category: 'Desserts', description: 'Delicious desserts', items: [
    { name: 'Tiramisu', description: 'Classic tiramisu', rating: 4.5, reviews: 548, image: require('../images/tiramisu-2897900_1280.jpg') },
    { name: 'Gelato', description: 'Italian gelato', rating: 4.5, reviews: 548, image: require('../images/ice-cream-3611698_1280.jpg') },
    { name: 'Panna Cotta', description: 'Smooth panna cotta', rating: 4.5, reviews: 548, image: require('../images/panacotta.jpg') },
    { name: 'Cannoli', description: 'Sweet cannoli', rating: 4.5, reviews: 548, image: require('../images/cannoli.jpg') },
  ]},
  { category: 'Salads', description: 'Fresh salads', items: [
    { name: 'Caesar Salad', description: 'Classic caesar salad', rating: 4.5, reviews: 548, image: require('../images/salad-4977372_1280.jpg') },
    { name: 'Greek Salad', description: 'Fresh greek salad', rating: 4.5, reviews: 548, image: require('../images/greeksalad.jpg') },
    { name: 'Garden Salad', description: 'Mixed garden salad', rating: 4.5, reviews: 548, image: require('../images/gardensalad.jpg') },
    { name: 'Pasta Salad', description: 'Delicious pasta salad', rating: 4.5, reviews: 548, image: require('../images/pastasalad.jpg') },
  ]},
];

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState(menuItems[0].category);

  const currentCategory = menuItems.find(cat => cat.category === selectedCategory) || menuItems[0];

  if (!currentCategory) {
    return <div className="menu-container">No menu categories available.</div>;
  }

  return (
    <div className="menu-container">
      <aside className="menu-sidebar">
        <div className="restaurant-info">
          <h1>Foodit</h1>
          <h2>VINCENT RESTAURANT</h2>
          <p>4.5 ★★★★☆ (548 Reviews)</p>
          <p>1580 Boone Street, Corpus Christi, TX, 78476 - USA</p>
          <p>Phone: 088866777555</p>
          <p>Monday - Friday 11:30am - 2:00pm</p>
        </div>
        <nav className="category-nav">
          {menuItems.map(({ category }) => (
            <button
              key={category}
              className={`category-button ${category === selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
      </aside>
      <main className="menu-main">
        <h2>{currentCategory.category}</h2>
        <p className="category-description">{currentCategory.description}</p>
        <div className="items-grid">
          {currentCategory.items.map(({ name, description, rating, reviews, image }, index) => (
            <div key={index} className="menu-item">
              <img src={image} alt={name} className="menu-item-image" />
              <div className="menu-item-details">
                <h3>{name}</h3>
                <p>{description}</p>
                <div className="rating">
                  <span>⭐ {rating}</span>
                  <span>({reviews} Reviews)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Menu;
