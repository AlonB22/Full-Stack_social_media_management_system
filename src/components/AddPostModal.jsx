/*
  ===========================================
  ADD POST MODAL COMPONENT
  ===========================================

  A floating modal window that appears in the center of the screen
  with a form to create a new post. Includes all necessary fields
  for creating a post via the API.

  Props:
  - isOpen: boolean to show/hide modal
  - onClose: function to close modal
  - onSubmit: function to handle form submission
  - authors: array of available authors
  - categories: array of available categories
  - isSubmitting: boolean to show loading state
*/

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AddPostModal.css';

function AddPostModal({ isOpen, onClose, onSubmit, authors, categories, isSubmitting }) {

  // Form state
  // Hardcoding Sys Admin's email
  const SYS_ADMIN_EMAIL = 'sys.admin@socialmediaposts.com';

  const [formData, setFormData] = useState({
    authorEmail: SYS_ADMIN_EMAIL,
    content: '',
    category: '',
    location: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        authorEmail: SYS_ADMIN_EMAIL,
        content: '',
        category: '',
        location: ''
      });
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      alert('Please enter post content');
      return;
    }

    // Prepare data for submission
    const postData = {
      authorEmail: formData.authorEmail,
      content: formData.content.trim(),
      category: formData.category || '',
      location: formData.location.trim() || '',
      tags: [] // Tags removed from UI, sending empty array
    };

    onSubmit(postData);
  };

  // Don't render if modal is closed
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">Add New Post</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Author Selection (Read-Only) */}
          <div className="form-group">
            <label className="form-label">
              Author
            </label>
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#EDF2F7', 
              borderRadius: '6px',
              color: '#4A5568',
              fontWeight: 500
            }}>
              Sys Admin (System Administrator)
            </div>
          </div>

          {/* Post Content */}
          <div className="form-group">
            <label htmlFor="content" className="form-label">
              Content <span className="required">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Enter your post content..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., New York, NY"
              disabled={isSubmitting}
            />
          </div>

          {/* Modal Footer - Buttons */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPostModal;
