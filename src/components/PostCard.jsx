/*
  ===========================================
  POST CARD COMPONENT
  ===========================================
  
  This is each individual post box showing:
  - An image at the top (or a colorful gradient if no image)
  - Author name and their job title
  - Category tag (like "Technology" or "Product")
  - The post content (what they wrote)
  - The date and relative time (like "2 days ago")
  - Stats: 👍 likes (thumbs up), 💬 comments (message), 📊 engagements (bar chart)
  - Edit and Delete buttons
  
  Props (inputs) we receive:
  - post: all the information about this specific post
  - onEdit: function to call when Edit is clicked
  - onDelete: function to call when Delete is clicked
*/

// Import custom PNG icons
import likesIcon from '../assets/👍.png';
import commentsIcon from '../assets/💬.png';
import engagementsIcon from '../assets/📊.png';
import editIcon from '../assets/✏️.png';
import deleteIcon from '../assets/🗑️.png';
import './PostCard.css';

// Helper function to format numbers (1234 becomes "1,234")
function formatNumber(num) {
  return num.toLocaleString();
}

// Helper function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Helper function to get relative time (like "2 days ago")
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

// Generate a gradient based on category (for posts without images)
// Matching the colors from the Figma design
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

// Convert SVG string to a data URL for use in img src
function svgToDataUrl(svgString) {
  if (!svgString) return null;
  // Encode the SVG for use in a data URL
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml,${encoded}`;
}

// Check if a post has a valid SVG image
function hasValidImage(image) {
  return image && image.trim() !== '' && image.includes('<svg');
}

// Get display name for category (shown on the gradient area)
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

function PostCard({ post, onEdit, onDelete, onClick }) {
  // Check if we have a valid SVG image
  const hasSvgImage = hasValidImage(post.image);
  const imageDataUrl = hasSvgImage ? svgToDataUrl(post.image) : null;
  
  return (
    <article 
      className="post-card" 
      aria-label={`Post by ${post.author.name}`}
      onClick={() => onClick && onClick(post)}
      style={{ cursor: 'pointer' }}
    >
      {/* Image or Gradient Background */}
      <div 
        className={`post-image ${hasSvgImage ? 'has-image' : ''} post-image-${(post.category || 'default').toLowerCase().replace(' ', '-')}`}
        style={!hasSvgImage ? { background: getCategoryGradient(post.category) } : undefined}
      >
        {/* Render actual SVG image if available */}
        {hasSvgImage && (
          <img 
            src={imageDataUrl} 
            alt={`${post.category} illustration`}
            className="post-image-svg"
          />
        )}
        {/* Category display name centered on the image (only show on gradient fallback) */}
        {!hasSvgImage && (
          <span className="post-category-overlay">{getCategoryDisplayName(post.category)}</span>
        )}
      </div>
      
      {/* Author Info */}
      <div className="post-author">
        <div className="author-avatar-placeholder">
          {post.author.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()}
        </div>
        <div className="author-info">
          <h3 className="author-name">{post.author.name}</h3>
          <p className="author-title">
            {post.author.title}{post.author.company ? ` at ${post.author.company}` : ''}
          </p>
        </div>
      </div>
      
      {/* Category Tag */}
      <div className="post-category-container">
        <span className="post-category-tag">{post.category}</span>
      </div>
      
      {/* Post Content */}
      <p className="post-content">{post.content}</p>
      
      {/* Date */}
      <p className="post-date">
        <span className="relative-time">{getRelativeTime(post.date)}</span>
        <span className="separator"> • </span>
        <span className="full-date">{formatDate(post.date)}</span>
      </p>
      
      {/* Stats and Actions */}
      <div className="post-footer">
        {/* Stats - Using custom PNG icons: 👍 Likes, 💬 Comments, 📊 Total Engagements */}
        <div className="post-stats">
          <div className="stat-item stat-likes" aria-label={`${post.likes} likes`}>
            <img src={likesIcon} alt="" className="stat-icon" aria-hidden="true" />
            <span>{formatNumber(post.likes)}</span>
          </div>
          <div className="stat-item stat-comments" aria-label={`${post.comments} comments`}>
            <img src={commentsIcon} alt="" className="stat-icon" aria-hidden="true" />
            <span>{formatNumber(post.comments)}</span>
          </div>
          <div className="stat-item stat-engagements" aria-label={`${post.totalEngagements} total engagements`}>
            <img src={engagementsIcon} alt="" className="stat-icon" aria-hidden="true" />
            <span>{formatNumber(post.totalEngagements || (post.likes + post.comments))}</span>
          </div>
        </div>
        
        {/* Action Buttons - Using custom PNG icons */}
        <div className="post-actions">
          <button 
            className="action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(post);
            }}
            aria-label={`Edit post by ${post.author.name}`}
          >
            <img src={editIcon} alt="" className="action-icon" aria-hidden="true" />
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(post.id);
            }}
            aria-label={`Delete post by ${post.author.name}`}
          >
            <img src={deleteIcon} alt="" className="action-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default PostCard;

