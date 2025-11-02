import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const [activeSection, setActiveSection] = useState('staff');
  const [staffMembers, setStaffMembers] = useState([]);
  const [diningImages, setDiningImages] = useState([]);
  const [kitchenImages, setKitchenImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: '',
    category: 'kitchen',
    description: '',
    image: null
  });
  const [newImage, setNewImage] = useState({
    category: 'dining',
    description: '',
    image: null
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchGalleryData();
  }, []);

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

  // Staff Management Functions
  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role || !newStaff.image) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newStaff.name);
      formData.append('role', newStaff.role);
      formData.append('category', newStaff.category);
      formData.append('description', newStaff.description);
      formData.append('image', newStaff.image);

      await axios.post('http://localhost:5000/api/gallery/staff', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Staff member added successfully!');
      setNewStaff({
        name: '',
        role: '',
        category: 'kitchen',
        description: '',
        image: null
      });
      fetchGalleryData();
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Failed to add staff member');
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    if (!editingStaff.name || !editingStaff.role) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editingStaff.name);
      formData.append('role', editingStaff.role);
      formData.append('category', editingStaff.category);
      formData.append('description', editingStaff.description);
      if (editingStaff.image instanceof File) {
        formData.append('image', editingStaff.image);
      }

      await axios.put(`http://localhost:5000/api/gallery/staff/${editingStaff._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Staff member updated successfully!');
      setEditingStaff(null);
      fetchGalleryData();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Failed to update staff member');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await axios.delete(`http://localhost:5000/api/gallery/staff/${staffId}`);
      alert('Staff member deleted successfully!');
      setConfirmDelete(null);
      fetchGalleryData();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  // Image Management Functions
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImage.image) {
      alert('Please select an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('category', newImage.category);
      formData.append('description', newImage.description);
      formData.append('image', newImage.image);

      await axios.post('http://localhost:5000/api/gallery/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Image added successfully!');
      setNewImage({
        category: 'dining',
        description: '',
        image: null
      });
      fetchGalleryData();
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image');
    }
  };

  const handleDeleteImage = async (imageId, category) => {
    try {
      await axios.delete(`http://localhost:5000/api/gallery/images/${imageId}?category=${category}`);
      alert('Image deleted successfully!');
      fetchGalleryData();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  if (loading) {
    return <div className="loading">Loading gallery data...</div>;
  }

  return (
    <div className="gallery-management">  
      {/* Section Navigation */}
      <div className="section-navigation">
        <button 
          className={`section-btn ${activeSection === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveSection('staff')}
        >
          Staff Management
        </button>
        <button 
          className={`section-btn ${activeSection === 'images' ? 'active' : ''}`}
          onClick={() => setActiveSection('images')}
        >
          Image Management
        </button>
      </div>

      {/* Staff Management Section */}
      {activeSection === 'staff' && (
        <div className="staff-management">
          <h3>Manage Staff Members</h3>
          
          {/* Add/Edit Staff Form */}
          <div className="staff-form">
            <h4>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h4>
            <form onSubmit={editingStaff ? handleEditStaff : handleAddStaff}>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Name *"
                  value={editingStaff ? editingStaff.name : newStaff.name}
                  onChange={(e) => editingStaff 
                    ? setEditingStaff({...editingStaff, name: e.target.value})
                    : setNewStaff({...newStaff, name: e.target.value})
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Role *"
                  value={editingStaff ? editingStaff.role : newStaff.role}
                  onChange={(e) => editingStaff 
                    ? setEditingStaff({...editingStaff, role: e.target.value})
                    : setNewStaff({...newStaff, role: e.target.value})
                  }
                  required
                />
              </div>
              
              <div className="form-row">
                <select
                  value={editingStaff ? editingStaff.category : newStaff.category}
                  onChange={(e) => editingStaff 
                    ? setEditingStaff({...editingStaff, category: e.target.value})
                    : setNewStaff({...newStaff, category: e.target.value})
                  }
                >
                  <option value="kitchen">Kitchen Staff</option>
                  <option value="service">Service Staff</option>
                  <option value="support">Support Staff</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Description"
                  value={editingStaff ? editingStaff.description : newStaff.description}
                  onChange={(e) => editingStaff 
                    ? setEditingStaff({...editingStaff, description: e.target.value})
                    : setNewStaff({...newStaff, description: e.target.value})
                  }
                />
              </div>
              
              <div className="form-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (editingStaff) {
                        setEditingStaff({...editingStaff, image: file});
                      } else {
                        setNewStaff({...newStaff, image: file});
                      }
                    }
                  }}
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </button>
                {editingStaff && (
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setEditingStaff(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Staff List */}
          <div className="staff-list">
            <h4>Current Staff Members</h4>
            <div className="staff-categories">
              {['kitchen', 'service', 'support'].map(category => (
                <div key={category} className="staff-category">
                  <h5>{category.charAt(0).toUpperCase() + category.slice(1)} Staff</h5>
                  <div className="staff-grid">
                    {staffMembers
                      .filter(staff => staff.category === category)
                      .map(staff => (
                        <div key={staff._id} className="staff-card">
                          <img 
                            src={`http://localhost:5000/images/${staff.image}`} 
                            alt={staff.name}
                            className="staff-image"
                          />
                          <div className="staff-info">
                            <h6>{staff.name}</h6>
                            <p className="staff-role">{staff.role}</p>
                          </div>
                          <div className="staff-actions">
                            <button 
                              className="edit-btn"
                              onClick={() => setEditingStaff(staff)}
                            >
                              Edit
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => setConfirmDelete(staff)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Management Section */}
      {activeSection === 'images' && (
        <div className="image-management">
          <h3>Manage Gallery Images</h3>
          
          {/* Add Image Form */}
          <div className="image-form">
            <h4>Add New Image</h4>
            <form onSubmit={handleAddImage}>
              <div className="form-row">
                <select
                  value={newImage.category}
                  onChange={(e) => setNewImage({...newImage, category: e.target.value})}
                >
                  <option value="dining">Dining Experience</option>
                  <option value="kitchen">Kitchen/Beyond the Plate</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Image Description"
                  value={newImage.description}
                  onChange={(e) => setNewImage({...newImage, description: e.target.value})}
                />
              </div>
              
              <div className="form-row">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewImage({...newImage, image: file});
                    }
                  }}
                  required
                />
              </div>
              
              <button type="submit" className="save-btn">Add Image</button>
            </form>
          </div>

          {/* Image Lists */}
          <div className="image-lists">
            {/* Dining Experience Images */}
            <div className="image-category">
              <h4>Dining Experience Images</h4>
              <div className="image-grid">
                {diningImages.map(image => (
                  <div key={image._id} className="image-card">
                    <img 
                      src={`http://localhost:5000/images/${image.filename}`} 
                      alt={image.description || 'Dining experience'}
                      className="gallery-image"
                    />
                    {image.description && (
                      <p className="image-description">{image.description}</p>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteImage(image._id, 'dining')}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                
              </div>
            </div>

            {/* Kitchen Images */}
            <div className="image-category">
              <h4>Kitchen/Beyond the Plate Images</h4>
              <div className="image-grid">
                {kitchenImages.map(image => (
                  <div key={image._id} className="image-card">
                    <img 
                      src={`http://localhost:5000/images/${image.filename}`} 
                      alt={image.description || 'Kitchen preparation'}
                      className="image"
                    />
                    {image.description && (
                      <p className="image-description">{image.description}</p>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteImage(image._id, 'kitchen')}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="confirm-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {confirmDelete.name}?</p>
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={() => handleDeleteStaff(confirmDelete._id)}
              >
                Yes, Delete
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default GalleryManagement;
