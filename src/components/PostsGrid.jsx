/*
  ===========================================
  POSTS GRID COMPONENT
  ===========================================
  
  This component displays all the post cards in a grid layout.
  
  Think of it like a shelf that holds multiple books (cards).
  The grid arranges them nicely in rows and columns.
  
  It also handles:
  - Loading state (shows skeleton cards while loading)
  - Empty state (shows a friendly message if no posts found)
*/

import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import './PostsGrid.css';

function PostsGrid({ posts, isLoading, onEditPost, onDeletePost, onPostClick }) {
  
  // LOADING STATE: Show skeleton cards while data is loading
  if (isLoading) {
    return (
      <section className="posts-section" aria-label="Loading posts">
        <div className="posts-grid">
          {/* Create 3 skeleton cards (matching posts per page) */}
          {[1, 2, 3].map((num) => (
            <PostCardSkeleton key={num} />
          ))}
        </div>
      </section>
    );
  }
  
  // EMPTY STATE: Show friendly message if no posts found
  if (!posts || posts.length === 0) {
    return (
      <section className="posts-section" aria-label="No posts found">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2 className="empty-title">No posts found</h2>
          <p className="empty-message">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
      </section>
    );
  }
  
  // NORMAL STATE: Show the grid of posts
  return (
    <section className="posts-section" aria-label="Social media posts">
      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard 
            key={post.id}
            post={post}
            onEdit={onEditPost}
            onDelete={onDeletePost}
            onClick={onPostClick}
          />
        ))}
      </div>
    </section>
  );
}

export default PostsGrid;

