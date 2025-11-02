import React, { useState, useEffect } from 'react';
import './Gallery.css';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Calendar, ChefHat, Lightbulb, Award } from "lucide-react"; // icons
import Breadcrumb from '../components/Breadcrumb';

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('ourStory');
  const [staffMembers, setStaffMembers] = useState([]);
  const [diningImages, setDiningImages] = useState([]);
  const [kitchenImages, setKitchenImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeImages, setActiveImages] = useState([]); // for dining/kitchen
  const [selectedStaff, setSelectedStaff] = useState(null); // NEW: staff popup state

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === activeImages.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? activeImages.length - 1 : prev - 1
    );
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        setLoading(true);
        // Fetch staff members
        const staffResponse = await axios.get('http://localhost:5000/api/gallery/staff');
        setStaffMembers(staffResponse.data);

        // Fetch dining experience images
        const diningResponse = await axios.get('http://localhost:5000/api/gallery/dining');
        setDiningImages(diningResponse.data);

        // Fetch kitchen images
        const kitchenResponse = await axios.get('http://localhost:5000/api/gallery/kitchen');
        setKitchenImages(kitchenResponse.data);

        setLoading(false);
      } catch (err) {
        setError('Failed to load gallery data');
        setLoading(false);
        console.error('Error fetching gallery data:', err);
      }
    };
    fetchGalleryData();
  }, []);


  const OurStaffTab = () => (
    <div className="tab-content our-staff">
      <div className="staff-header">
        <h2>Meet Our Team</h2>
        <p>The talented individuals who make Vincent Pizza special !!</p>
      </div>

      {loading ? (
        <div className="loading">Loading staff members...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="staff-categories">
          {/* Kitchen Staff */}
          <div className="staff-category">
            <h3>Kitchen Staff</h3>
            <div className="staff-grid">
              {staffMembers
                .filter(staff => staff.category === 'kitchen')
                .map((staff, index) => (
                  <div
                    key={staff._id || index}
                    className="staff-cards"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <img
                      src={`http://localhost:5000/images/${staff.image}`}
                      alt={staff.name}
                      className="staff-images"
                    />
                    <div className="staff-info">
                      <h4>{staff.name}</h4>
                      <p className="staff-roles">{staff.role}</p>
                    </div>
                    <h4 className='details'>click to view details</h4>
                  </div>
                ))}
            </div>
          </div>

          {/* Service Staff */}
          <div className="staff-category">
            <h3>Service Staff</h3>
            <div className="staff-grid">
              {staffMembers
                .filter(staff => staff.category === 'service')
                .map((staff, index) => (
                  <div
                    key={staff._id || index}
                    className="staff-cards"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <img
                      src={`http://localhost:5000/images/${staff.image}`}
                      alt={staff.name}
                      className="staff-images"
                    />
                    <div className="staff-info">
                      <h4>{staff.name}</h4>
                      <p className="staff-roles">{staff.role}</p>
                    </div>
                    <h4 className='details'>click to view details</h4>
                  </div>
                ))}
            </div>
          </div>

          {/* Support Staff */}
          <div className="staff-category">
            <h3>Support & Others</h3>
            <div className="staff-grid">
              {staffMembers
                .filter(staff => staff.category === 'support')
                .map((staff, index) => (
                  <div
                    key={staff._id || index}
                    className="staff-cards"
                    onClick={() => setSelectedStaff(staff)}
                  >
                    <img
                      src={`http://localhost:5000/images/${staff.image}`}
                      alt={staff.name}
                      className="staff-images"
                    />
                    <div className="staff-info">
                      <h4>{staff.name}</h4>
                      <p className="staff-roles">{staff.role}</p>
                    </div>
                    <h4 className='details'>click to view details</h4>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const DiningExperienceTab = ({ diningImages, loading, error }) => (
    <div className="dining-experience">
      <div className="dining-header">
        <h2>Dining Experience</h2>
        <p>Immerse yourself in our beautiful ambiance</p>
      </div>
      {loading ? (
        <div className="loading">Loading dining images...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="image-gallery">
          {diningImages.map((image, index) => (
            <div key={image._id || index} className="gallery-item">
              <img
                src={`http://localhost:5000/images/${image.filename}`}
                alt={image.description || "Dining experience"}
                className="gallery-images"
                onClick={() => {
                  setActiveImages(diningImages);
                  setSelectedIndex(index);
                }}
              />
              {image.description && (
                <div className="image-caption">
                  <p>{image.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const BeyondThePlateTab = () => (
    <div className="tab-content beyond-plate">
      <div className="beyond-header">
        <h2>Beyond the Plate</h2>
        <p>Behind the scenes of culinary excellence</p>
      </div>
      {loading ? (
        <div className="loading">Loading kitchen images...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="image-gallery">
          {kitchenImages.map((image, index) => (
            <div
              key={image._id || index}
              className="gallery-itm"
              onClick={() => {
                setActiveImages(kitchenImages);
                setSelectedIndex(index);
              }}
            >
              <img
                src={`http://localhost:5000/images/${image.filename}`}
                alt={image.description || "Kitchen preparation"}
                className="gallery-img"
              />
              {image.description && (
                <div className="image-caption">
                  <p>{image.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Lightbox for dining/kitchen
  const Lightbox = () =>
    selectedIndex !== null && activeImages.length > 0 ? (
      <div className="overlay">

        <button className="close-btn" onClick={() => setSelectedIndex(null)}>
          <X size={28} />
        </button>
        <button className="prev-btn" onClick={handlePrev}>
          <ChevronLeft size={36} />
        </button>
        <img
          src={`http://localhost:5000/images/${activeImages[selectedIndex].filename}`}
          alt={activeImages[selectedIndex].description || "Expanded view"}
          className="expanded-image"
        />
        <button className="next-btn" onClick={handleNext}>
          <ChevronRight size={36} />
        </button>
      </div>
    ) : null;

  // Staff Lightbox
  const StaffLightbox = () =>
    selectedStaff ? (
      <div className="lightbox-overlay">
        <div className="staff-lightbox-content">

          {/* Left Image */}
          <img
            src={`http://localhost:5000/images/${selectedStaff.image}`}
            alt={selectedStaff.name}
            className="staff-lightbox-image"
          />

          {/* Right Details */}
          <div className="staff-lightbox-details">
            <button className="close-btn-staff" onClick={() => setSelectedStaff(null)}>
              <X size={20} />
            </button>

            <h2>{selectedStaff.name}</h2>
            <p className="staff-roles">Designation : <strong>{selectedStaff.role}</strong></p>
            <p className="staff-description">{selectedStaff.name}'s details : {selectedStaff.description}</p>
            {selectedStaff.experience && (
              <p><strong>Experience:</strong> {selectedStaff.experience}</p>
            )}

          </div>
        </div>
      </div>
    ) : null;


  return (
    <div className="gallery-container">
      <Breadcrumb style={{ position: "absolute", left: "100px" }} />
      <div className="gallery-header">
        <h1>Vincent Pizza Gallery</h1>
        <p>Discover the story behind our culinary excellence</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">

        <button
          className={`tab-btn ${activeTab === 'ourStaff' ? 'active' : ''}`}
          onClick={() => setActiveTab('ourStaff')}
        >
          Our Staff
        </button>
        <button
          className={`tab-btn ${activeTab === 'diningExperience' ? 'active' : ''}`}
          onClick={() => setActiveTab('diningExperience')}
        >
          Dining Experience
        </button>
        <button
          className={`tab-btn ${activeTab === 'beyondThePlate' ? 'active' : ''}`}
          onClick={() => setActiveTab('beyondThePlate')}
        >
          Beyond the Plate
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-container">
        {activeTab === 'ourStaff' && <OurStaffTab />}
        {activeTab === 'diningExperience' && (
          <DiningExperienceTab
            diningImages={diningImages}
            loading={loading}
            error={error}
          />
        )}
        {activeTab === 'beyondThePlate' && <BeyondThePlateTab />}
      </div>

      {/* Popups */}
      <Lightbox />
      <StaffLightbox />
    </div>
  );
};

export default Gallery;
