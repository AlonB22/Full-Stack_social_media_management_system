/*
  ===========================================
  POST CARD SKELETON COMPONENT
  ===========================================
  
  A "skeleton" is a placeholder that shows while real data is loading.
  It's like a gray silhouette of what the real card will look like.
  
  This makes the app feel faster because users see something immediately
  instead of a blank screen. The gray shapes "pulse" with an animation
  to show that something is loading.
*/

import './PostCardSkeleton.css';

function PostCardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      {/* Image placeholder */}
      <div className="skeleton-image skeleton-shimmer"></div>
      
      {/* Author placeholder */}
      <div className="skeleton-author">
        <div className="skeleton-avatar skeleton-shimmer"></div>
        <div className="skeleton-author-info">
          <div className="skeleton-name skeleton-shimmer"></div>
          <div className="skeleton-title skeleton-shimmer"></div>
        </div>
      </div>
      
      {/* Category tag placeholder */}
      <div className="skeleton-category skeleton-shimmer"></div>
      
      {/* Content lines placeholder */}
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-shimmer" style={{ width: '100%' }}></div>
        <div className="skeleton-line skeleton-shimmer" style={{ width: '90%' }}></div>
        <div className="skeleton-line skeleton-shimmer" style={{ width: '75%' }}></div>
      </div>
      
      {/* Date placeholder */}
      <div className="skeleton-date skeleton-shimmer"></div>
      
      {/* Footer placeholder */}
      <div className="skeleton-footer">
        <div className="skeleton-stats">
          <div className="skeleton-stat skeleton-shimmer"></div>
          <div className="skeleton-stat skeleton-shimmer"></div>
          <div className="skeleton-stat skeleton-shimmer"></div>
        </div>
        <div className="skeleton-actions">
          <div className="skeleton-action skeleton-shimmer"></div>
          <div className="skeleton-action skeleton-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

export default PostCardSkeleton;

