/*
  ===========================================
  POST MODAL COMPONENT
  ===========================================
  
  Displays full details of a post in a modal window.
*/

import { X } from 'lucide-react';
import { useEffect } from 'react';
import likesIcon from '../assets/👍.png';
import commentsIcon from '../assets/💬.png';
import engagementsIcon from '../assets/📊.png';
import './PostModal.css';

// Reuse helper functions from PostCard (or refactor to utils later)
function formatNumber(num) {
  return num.toLocaleString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCategoryGradient(category) {
  const gradients = {
    'Technology': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'Product': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Industry Insights': 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'Marketing': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Design': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'default': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  };
  return gradients[category] || gradients['default'];
}

function svgToDataUrl(svgString) {
  if (!svgString) return null;
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

function hasValidImage(image) {
  return image && image.trim() !== '' && image.includes('<svg');
}

function getCategoryDisplayName(category) {
  const names = {
    'Technology': 'Tech Innovation',
    'Product': 'Product',
    'Industry Insights': 'Industry Insights',
    'Marketing': 'Marketing',
    'Design': 'Design'
  };
  return names[category] || category;
}

function PostModal({ isOpen, onClose, post }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const hasSvgImage = hasValidImage(post.image);
  const imageDataUrl = hasSvgImage ? svgToDataUrl(post.image) : null;

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Image Header with Close Button */}
        <div 
          className="post-modal-image-container"
          style={!hasSvgImage ? { background: getCategoryGradient(post.category) } : undefined}
        >
          <button className="post-modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
          
          {hasSvgImage && (
            <img 
              src={imageDataUrl} 
              alt={`${post.category} illustration`}
              className="post-modal-image-svg"
            />
          )}
          {!hasSvgImage && (
            <span className="post-modal-category-overlay">
              {getCategoryDisplayName(post.category)}
            </span>
          )}
        </div>

        <div className="post-modal-body">
          {/* Author Section */}
          <div className="post-modal-author-section">
            <div className="author-avatar-placeholder">
              {post.author.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <div className="post-modal-author-info">
              <h2>{post.author.name}</h2>
              <p className="post-modal-author-title">
                {post.author.title} {post.author.company ? `@ ${post.author.company}` : ''}
              </p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="post-modal-meta">
             <span className="post-modal-tag">{post.category}</span>
             <span>📅 {formatDate(post.date)}</span>
             {post.location && <span>📍 {post.location}</span>}
          </div>

          {/* Content */}
          <div className="post-modal-content-text">
            {post.content}
          </div>

          {/* Stats */}
          <div className="post-modal-stats">
            <div className="post-modal-stat-item">
              <img src={likesIcon} alt="Likes" className="post-modal-stat-icon" />
              <span className="post-modal-stat-value">{formatNumber(post.likes)}</span>
              <span className="post-modal-stat-label">Likes</span>
            </div>
            <div className="post-modal-stat-item">
              <img src={commentsIcon} alt="Comments" className="post-modal-stat-icon" />
              <span className="post-modal-stat-value">{formatNumber(post.comments)}</span>
              <span className="post-modal-stat-label">Comments</span>
            </div>
            <div className="post-modal-stat-item">
              <img src={engagementsIcon} alt="Engagements" className="post-modal-stat-icon" />
              <span className="post-modal-stat-value">{formatNumber(post.totalEngagements || (post.likes + post.comments))}</span>
              <span className="post-modal-stat-label">Total Engagements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
