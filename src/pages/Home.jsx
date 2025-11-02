import React, { useState, useEffect } from 'react';
import './Home.css';
import heroImage from '../images/bgimg.jpg';
import logo from '../images/restaurant-logo.png';
import heroImg from '../images/champagne.jpg';
import { FaUserCircle } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";


const Home = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const [showMsg, setShowMsg] = useState(false); // for contact form message box


  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);


  const loginSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const registerSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Full Name is required"),

    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),

    password: Yup.string()
      .min(6, "Password must be at least 6 characters"  )
      .required("Password is required"),
  });


  // App.js or index.js
  useEffect(() => {
    // Clear storage when app restarts
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Or if you want to clear everything
    // localStorage.clear(); 
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };


  //user login
  const loginFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.token);
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          setShowLogin(false);
        } else {
          alert(data.msg);
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong. Please try again.");
      }
    },
  });



  // const handleRegisterSubmit = async (e) => {
  //   e.preventDefault();
  //   const name = e.target.name.value;
  //   const email = e.target.email.value;
  //   const password = e.target.password.value;

  //   try {
  //     const res = await fetch("http://localhost:5000/api/auth/register", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ name, email, password })
  //     });
  //     const data = await res.json();

  //     if (res.ok) {
  //       // Automatically login after registration
  //       const loginRes = await fetch("http://localhost:5000/api/auth/login", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ email, password })
  //       });
  //       const loginData = await loginRes.json();

  //       if (loginRes.ok) {
  //         localStorage.setItem("token", loginData.token);
  //         localStorage.setItem("user", JSON.stringify(loginData.user));
  //         setUser(loginData.user);
  //         setShowRegister(false);
  //       } else {
  //         alert(loginData.msg);
  //       }
  //     } else {
  //       alert(data.msg);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }


  // };

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const data = await res.json();

        if (res.ok) {
          alert("Registration successful!");
          setShowRegister(false);
          setShowLogin(true);
        } else {
          alert(data.msg);
        }
      } catch (err) {
        console.error(err);
        alert("Error while registering!");
      }
    },
  });

  const handleRequireLogin = () => {
    setShowLoginWarning(true);
    setTimeout(() => setShowLoginWarning(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowMsg(true); // show message box
    setTimeout(() => setShowMsg(false), 3000); // auto hide after 3s
  };





  return (
    <div className="home">
      {/* Header */}
      <header className="header">
        <img className='logo' src={logo} alt="logo" width='160px' />

        <nav className="nav-links">
          <a href="#">HOME</a>
          <a href="order">MENU</a>
          <a href="Gallery" blank=" ">GALLERY</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </nav>

        <button
          className="reserve-btn"
          onClick={() => user ? window.open('/table-reservation', '_blank') : handleRequireLogin()}
        >
          RESERVE TABLE
        </button>

        <div className="header-buttons">
          {user ? (
            <>
              <span className="welcome-text">Welcome  {user.name}</span>
              <br />
              <button className="auth-btn2" onClick={handleLogout}>LOG OUT</button>
            </>
          ) : (
            <div className="user-menu">
              <FaUserCircle
                className="user-icon"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="dropdown-menu">
                  <span onClick={() => { setShowLogin(true); setShowDropdown(false); }}>Login</span>
                  <span onClick={() => { setShowRegister(true); setShowDropdown(false); }}>Register</span>
                </div>
              )}

            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="hero-content">
          <h1>VINCENT PIZZA.</h1>
          <h2>MAKING PEOPLE HAPPY</h2>
          <p>Italian Pizza With Cherry Tomatoes and Green Basil</p>
          <div className="hero-buttons">
            <button
              className="order"
              onClick={() => user ? window.open('/order', '_blank') : handleRequireLogin()}
            >
              Order Now
            </button>
            <button
              className="order"
              onClick={() => window.open('/Gallery', '_blank')}
            >
              Who We Are
            </button>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="contact-us">
        <div className="contact-container">
          <div className="contact-left">
            <h2>Get in touch with us & send us message today!</h2>
            <p>
              Saasbiz is a different kind of architecture practice. Founded by
              LoganCee in 1964, we're an employee-owned firm pursuing a
              democratic design process that values everyone's input.
            </p>
            <h3>1580 Boone Street, Corpus Christi, TX, 78476 - USA</h3>
            <p>Email: vincent.pizza@gmail.com</p>
            <p>Phone: 088866777555</p>
          </div>
          <div className="contact-right">
            <form className="contact-form" onSubmit={handleSubmit}>
              <input type="text" placeholder="Name" className="contact-input" required />
              <input type="email" placeholder="Email" className="contact-input" required />
              <input type="text" placeholder="Subject" className="contact-input" />
              <textarea placeholder="Message" className="contact-textarea" required></textarea>
              <button type="submit" className="contact-button">SEND MESSAGE</button>
            </form>
          </div>
        </div>

        {/* Custom Message Box */}
        {showMsg && (
          <>
            <div className="message-overlay"></div>
            <div className="contactbox">
              <p>✅ Thank you for contacting us!</p>
            </div>
          </>
        )}
      </section>


      {/* Footer */}
      <section id="about" className="about-us">
        <div className="footer-container">
          <div className="footer-column logo-column">
            <img src={logo} alt="Vincent Pizza Logo" className="footer-logo" />
            <p>Our Restaurant is one of the bests, provide tasty Menus and Dishes. You can reserve a table or Order food.</p>
            <div className="social-icons">
              <a href="" onClick={() => window.open('https://www.facebook.com/vincentchicago', '_blank')} aria-label="Facebook" className="social-icon facebook">F</a>
              <a href="" onClick={() => window.open('https://x.com/VincentBistro', '_blank')} aria-label="Twitter" className="social-icon twitter">T</a>
              <a href="#" onClick={() => window.open('https://www.instagram.com/restaurante_vincent/', '_blank')} aria-label="Instagram" className="social-icon instagram">I</a>
              <a href="#" onClick={() => window.open('https://www.linkedin.com/company/restaurant-vincent-favre-f%C3%A9lix/', '_blank')} aria-label="LinkedIn" className="social-icon linkedin">L</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Headquarters</h3>
            <p>1580 Boone Street, Corpus Christi, TX, 78476 - USA</p>
            <p>vincent.pizza@gmail.com</p>
            <p>088866777555</p>
          </div>
          <div className="footer-column">
            <h3>Opening Hours</h3>
            <p>Monday - Friday 11:30am - 2:00pm</p>
          </div>
          <div className="footer-column subscribe-column">
            <h3>Subscribe to our contents</h3>
            <input type="email" placeholder="Email Address..." className="subscribe-input" />
            <button
              className="subscribe-button"
              onClick={() => {
                const heroSection = document.getElementById('hero');
                if (heroSection) heroSection.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>

      {/* ===== LOGIN MODAL ===== */}
      {showLogin && (
        <div className="auth-overlay">
          <div className="auth-container">
            {/* Close Button */}
            <button
              className="close-button"
              onClick={() => setShowLogin(false)}
            >
              ✕
            </button>

            <div className="auth-left">
              <h2>Welcome Back</h2>
              <p>Sign in with your email address and password.</p>

              <form onSubmit={loginFormik.handleSubmit} className="auth-form">

                <div className='field'>
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="johndoe@example.com"
                    {...loginFormik.getFieldProps("email")}
                  />
                  {loginFormik.touched.email && loginFormik.errors.email && (
                    <small className="yup-error">{loginFormik.errors.email}</small>
                  )}
                </div>

                <div className='field'>
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    {...loginFormik.getFieldProps("password")}
                  />
                  {loginFormik.touched.password && loginFormik.errors.password && (
                    <small className="yup-error">{loginFormik.errors.password}</small>
                  )}
                </div>

                <div className="auth-options">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#">Forgot Password?</a>
                </div>

                <button type="submit" className="auth-btn">Sign In</button>
              </form>


              <p className="switch-text">
                Don’t have an account?{" "}
                <span onClick={() => { setShowLogin(false); setShowRegister(true); }}>
                  Sign Up
                </span>
              </p>
            </div>

            <div className="auth-right">
              <img src={heroImg} alt="food" />
            </div>
          </div>
        </div>
      )}

      {/* ===== REGISTER MODAL ===== */}
      {showRegister && (
        <div className="auth-overlay">
          <div className="auth-container">
            {/* Close Button */}
            <button
              className="close-button"
              onClick={() => setShowRegister(false)}
            >
              ✕
            </button>
            <div className="auth-left">
              <h2>Create Account</h2>
              <p>Sign up with your details to get started.</p>

              <form onSubmit={formik.handleSubmit} className="auth-form">

                <div className='field'>
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    {...formik.getFieldProps("name")}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <small className="yup-error">{formik.errors.name}</small>
                  )}
                </div>

                <div className='field'>

                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="johndoe@example.com"
                    {...formik.getFieldProps("email")}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <small className="yup-error">{formik.errors.email}</small>
                  )}
                </div>

                <div className='field'>

                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="********"
                    {...formik.getFieldProps("password")}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <small className="yup-error">{formik.errors.password}</small>
                  )}
                </div>

                <button type="submit" className="auth-btn">Register</button>
              </form>


              <p className="switch-text">
                Already have an account?{" "}
                <span onClick={() => { setShowRegister(false); setShowLogin(true); }}>
                  Login
                </span>
              </p>
            </div>

            <div className="auth-right">
              <img src={heroImg} alt="food" />
            </div>
          </div>
        </div>
      )}

      {/* ===== Animated login warning ===== */}
      {showLoginWarning && (
        <div className="login-warning">
          Please login first to continue
        </div>
      )}


    </div>
  );
};

export default Home;
