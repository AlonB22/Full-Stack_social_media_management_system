/*
  ===========================================
  HEADER COMPONENT
  ===========================================
  
  This is the dark bar at the very top of the page.
  It contains:
  - The title "Social Media Posts"
  - A subtitle explaining what the page does
  - The green "Add New Post" button
  
  Think of a component like a LEGO block - we build it once
  and can use it anywhere!
*/

import './Header.css';

// Import custom plus icon
import plusIcon from '../assets/➕.png';

// The 'onAddPost' is like a message we send to the parent when button is clicked
function Header({ onAddPost }) {
  return (
    // 'header' is a special HTML tag that tells browsers "this is the top section"
    <header className="header">
      <div className="header-container">
        {/* Left side - Title and description */}
        <div className="header-content">
          <h1 className="header-title">Social Media Posts</h1>
          <p className="header-subtitle">
            Browse and manage all social media posts with advanced filtering
          </p>
        </div>
        
        {/* Right side - Add New Post button */}
        <button 
          className="add-post-button"
          onClick={onAddPost}
          aria-label="Add new post"
        >
          <img src={plusIcon} alt="" className="add-post-icon" aria-hidden="true" />
          <span>Add New Post</span>
        </button>
      </div>
    </header>
  );
}

export default Header;

