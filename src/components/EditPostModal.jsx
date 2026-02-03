/*
  ===========================================
  EDIT POST MODAL COMPONENT
  ===========================================
  
  A floating modal window that allows editing an existing post's
  description and category.
*/

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './EditPostModal.css';

function EditPostModal({ isOpen, onClose, onSubmit, post, categories, isSubmitting }) {

  const [formData, setFormData] = useState({
    content: '',
    category: ''
  });

  // Populate form with post data when modal opens or post changes
  useEffect(() => {
    if (isOpen && post) {
      setFormData({
        content: post.content || '',
        category: post.category || ''
      });
    }
  }, [isOpen, post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      alert('Please enter post content');
      return;
    }
    onSubmit(post.id, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Post</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Post Content */}
          <div className="form-group">
            <label htmlFor="edit-content" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="edit-content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="form-textarea"
              rows={5}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="edit-category" className="form-label">
              Category
            </label>
            <select
              id="edit-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPostModal;
