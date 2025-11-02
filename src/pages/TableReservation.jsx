import React, { useState } from 'react';
import * as Yup from "yup";
import axios from 'axios';
import './TableReservation.css';
import { useFormik } from 'formik';
import Breadcrumb from '../components/Breadcrumb';

const TableReservation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    persons: 1,
  });


  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const ReservationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone must be 10 digits")
      .required("Phone number is required"),
    persons: Yup.number().min(1).max(30).required("Person is required"),
    date: Yup.date()
      .min(formatDate(today), "Past date not allowed")
      .max(formatDate(maxDate), "Only next 3 months allowed")
      .required("Date is required"),
    time: Yup.string()
      .required("Time is required")
      .test("within-working-hours", "Restaurant works between 10:00 AM to 12:00 PM", function (value) {
        if (!value) return false;

        return value >= "10:00" && value <= "24:00";
      })
      .test("valid-time", "Past time not allowed", function (value) {
        const { date } = this.parent;
        if (!date || !value) return true;

        const selectedDate = new Date(date);
        const today = new Date();

        if (selectedDate.toDateString() !== today.toDateString()) return true;

        const [hours, minutes] = value.split(":");
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);

        return selectedTime >= today;
      }),

  });


  const [popup, setPopup] = useState({ show: false, data: null, success: true });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      persons: 1,
    },
    validationSchema: ReservationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await axios.post('http://localhost:5000/Reservations', values);
        setPopup({ show: true, data: values, success: true });
        resetForm();
      } catch (err) {
        setPopup({ show: true, data: null, success: false });
      }
    },
  });


  return (
    <div className="reservation-page-live-bg">
      <Breadcrumb style={{ position: "absolute", left: "80px", top: "30px", "z-index": "9999" }} />

      <div className="live-background-center-glow"></div>
      <div className="live-background-particles"></div>

      <div className="reservation-header">
        <h1>RESERVE YOUR TABLE</h1>
        <p>VINCENT RESTAURANT</p>
        <p>Bringing the finest flavors right to your table.</p>
      </div>

      <div className="reservation-container-dark-bg">
        <form className="reservation-form-dark-bg" onSubmit={formik.handleSubmit}>
          <input
            type="text"
            name="name"

            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
            placeholder="Name"
          />
          {formik.touched.name && formik.errors.name && <p className="yup-error">{formik.errors.name}</p>}
          <input
            type="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            placeholder="Email"
          />
          {formik.touched.email && formik.errors.email && <p className="yup-error">{formik.errors.email}</p>}
          <input
            type="tel"
            name="phone"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.phone}
            placeholder="Phone Number"
          />
          {formik.touched.phone && formik.errors.phone && <p className="yup-error">{formik.errors.phone}</p>}
          <select name="persons" value={formik.values.persons} onChange={formik.handleChange}>
            {[...Array(30).keys()].map(n => (
              <option key={n + 1} value={n + 1}>{n + 1} Person{n + 1 > 1 ? 's' : ''}</option>
            ))}
          </select>
          {formik.touched.persons && formik.errors.persons && <p className="yup-error">{formik.errors.persons}</p>}
          <input
            type="date"
            name="date"
            min={formatDate(today)}
            max={formatDate(maxDate)}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.date}
          />
          {formik.touched.date && formik.errors.date && <p className="yup-error">{formik.errors.date}</p>}
          <input
            type="time"
            name="time"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.time}
            min={
              formik.values.date === formatDate(today)
                ? new Date().toISOString().slice(11, 16)
                : '10:00'
            }
            max={"24:00"}
          />
          {formik.touched.time && formik.errors.time && <p className="yup-error">{formik.errors.time}</p>}

          <button type="submit" className="submit-button-dark-bg">BOOK TABLE</button>
        </form>
      </div>

      {/* Popup Modal */}
      {popup.show && (
        <div className="popup-overlay" onClick={() => setPopup({ show: false, data: null, success: true })}>
          <div className={`popup-box ${popup.success ? 'success' : 'error'}`} onClick={(e) => e.stopPropagation()}>
            {popup.success && popup.data ? (
              <>
                <h2>✅ Reservation Confirmed!</h2>
                <p><strong>Name:</strong> {popup.data.name}</p>
                <p><strong>Email:</strong> {popup.data.email}</p>
                <p><strong>Phone:</strong> {popup.data.phone}</p>
                <p><strong>Date:</strong> {popup.data.date}</p>
                <p><strong>Time:</strong> {popup.data.time}</p>
                <p><strong>Persons:</strong> {popup.data.persons}</p>
              </>
            ) : (
              <h2>❌ Failed to save reservation</h2>
            )}
            <button onClick={() => setPopup({ show: false, data: null, success: true })}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableReservation;
