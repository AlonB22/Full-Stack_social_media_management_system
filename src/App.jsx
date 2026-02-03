/*
  ===========================================
  MAIN APP COMPONENT
  ===========================================
  
  This is the "parent" of all our components - like the main container
  that holds everything together. Think of it as the frame of a house
  that holds all the rooms (Header, Stats, Filters, Posts, Pagination).
  
  NOW CONNECTED TO REAL BACKEND API!
  - Data comes from SQLite database via Flask API
  - Posts are saved permanently
  - Real search, filter, and pagination
*/

import { useState, useEffect } from 'react';

// Import our components
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import Filters from './components/Filters';
import PostsGrid from './components/PostsGrid';
import Pagination from './components/Pagination';
import AddPostModal from './components/AddPostModal';
import EditPostModal from './components/EditPostModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import PostModal from './components/PostModal';

// Import API functions to talk to the backend
import * as api from './services/api';

// Import styles
import './App.css';

function App() {
  // ===============================================
  // STATE - The app's memory
  // ===============================================
  
  // Posts data from the API
  const [posts, setPosts] = useState([]);
  
  // Statistics from the API
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    avgEngagement: 0
  });
  
  // Categories from the API
  const [categories, setCategories] = useState([]);

  // Authors from the API (for Add Post modal)
  const [authors, setAuthors] = useState([]);

  // Loading state - shows skeleton while loading
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  
  // Pagination info from the API
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Posts per page (3 items per row)
  const postsPerPage = 3;
  
  // Filter values - what the user has typed/selected
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest'
  });
  
  // Applied filters (only updates when "Apply Filters" is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest'
  });
  
  // ===============================================
  // LOAD DATA FROM API
  // ===============================================
  
  // Load stats, categories, and authors once when app starts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load stats, categories, and authors in parallel
        const [statsData, categoriesData, authorsData] = await Promise.all([
          api.getStats(),
          api.getCategories(),
          api.getAuthors()
        ]);

        setStats(statsData);
        setCategories(categoriesData);
        setAuthors(authorsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);
  
  // Load posts whenever page or filters change
  useEffect(() => {
    const loadPosts = async () => {
      setIsLoading(true);
      
      try {
        const response = await api.getPosts({
          page: currentPage,
          limit: postsPerPage,
          search: appliedFilters.search,
          category: appliedFilters.category,
          dateFrom: appliedFilters.dateFrom,
          dateTo: appliedFilters.dateTo,
          sortBy: appliedFilters.sortBy
        });
        
        setPosts(response.posts);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPosts();
  }, [currentPage, appliedFilters]);
  
  // ===============================================
  // FILTER FUNCTIONS
  // ===============================================
  
  // Called when any filter input changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Called when "Apply Filters" button is clicked
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1); // Go back to first page after filtering
  };
  
  // Called when "Clear All" button is clicked
  const handleClearFilters = () => {
    const emptyFilters = {
      search: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest'
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
  };
  
  // ===============================================
  // PAGINATION
  // ===============================================
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // ===============================================
  // POST ACTIONS
  // ===============================================

  // Open the Add Post modal
  const handleAddPost = () => {
    setIsAddPostModalOpen(true);
  };

  // Handle post click (view details)
  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleClosePostModal = () => {
    setSelectedPost(null);
  };

  // Handle form submission from the modal
  const handleSubmitPost = async (postData) => {
    setIsSubmittingPost(true);

    try {
      await api.createPost(postData);

      // Reload posts and stats
      const [postsResponse, statsData] = await Promise.all([
        api.getPosts({
          page: currentPage,
          limit: postsPerPage,
          ...appliedFilters
        }),
        api.getStats()
      ]);

      setPosts(postsResponse.posts);
      setTotalPages(postsResponse.pagination.totalPages);
      setStats(statsData);

      // Close modal and reset state
      setIsAddPostModalOpen(false);
      setIsSubmittingPost(false);

      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      setIsSubmittingPost(false);
      alert('Error creating post. Make sure the backend is running.');
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    if (!isSubmittingPost) {
      setIsAddPostModalOpen(false);
    }
  };
  
  // Open Edit Modal
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditPostModalOpen(true);
  };

  // Handle Edit Submit
  const handleSubmitEdit = async (postId, updatedData) => {
    setIsSubmittingPost(true);
    
    try {
      await api.updatePost(postId, updatedData);
      
      // Reload posts and categories (in case category changed)
      const [postsResponse, categoriesResponse] = await Promise.all([
        api.getPosts({
          page: currentPage,
          limit: postsPerPage,
          ...appliedFilters
        }),
        api.getCategories()
      ]);
      
      setPosts(postsResponse.posts);
      setCategories(categoriesResponse);
      
      setIsEditPostModalOpen(false);
      setEditingPost(null);
      setIsSubmittingPost(false);
      
      alert('Post updated successfully!');
    } catch (error) {
      console.error('Error updating post:', error);
      setIsSubmittingPost(false);
      alert('Error updating post.');
    }
  };

  const handleCloseEditModal = () => {
    if (!isSubmittingPost) {
      setIsEditPostModalOpen(false);
      setEditingPost(null);
    }
  };
  
  // Initiate delete flow
  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setIsDeleteModalOpen(true);
  };

  // Confirm and execute delete
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    setIsSubmittingPost(true);
    
    try {
      await api.deletePost(postToDelete);
      
      // Reload posts and stats
      const [postsResponse, statsData] = await Promise.all([
        api.getPosts({
          page: currentPage,
          limit: postsPerPage,
          ...appliedFilters
        }),
        api.getStats()
      ]);
      
      setPosts(postsResponse.posts);
      setTotalPages(postsResponse.pagination.totalPages);
      setStats(statsData);
      
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
      setIsSubmittingPost(false);
      
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      setIsSubmittingPost(false);
      alert('Error deleting post.');
    }
  };

  const handleCloseDeleteModal = () => {
    if (!isSubmittingPost) {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };
  
  // ===============================================
  // RENDER
  // ===============================================
  
  return (
    <div className="app">
      {/* Header with Add New Post button */}
      <Header onAddPost={handleAddPost} />
      
      {/* Main content area */}
      <main className="main-content">
        {/* Stats cards: Total Posts, Likes, etc. */}
        <StatsCards stats={stats} />
        
        {/* Filter section */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          categories={categories}
        />
        
        {/* Grid of post cards */}
        <PostsGrid
          posts={posts}
          isLoading={isLoading}
          onEditPost={handleEditPost}
          onDeletePost={handleDeletePost}
          onPostClick={handlePostClick}
        />
        
        {/* Pagination at the bottom */}
        {!isLoading && posts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Add Post Modal */}
        <AddPostModal
          isOpen={isAddPostModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPost}
          authors={authors}
          categories={categories}
          isSubmitting={isSubmittingPost}
        />

        {/* Edit Post Modal */}
        <EditPostModal
          isOpen={isEditPostModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleSubmitEdit}
          post={editingPost}
          categories={categories}
          isSubmitting={isSubmittingPost}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          isDeleting={isSubmittingPost}
        />

        {/* Post Details Modal */}
        <PostModal
          isOpen={!!selectedPost}
          onClose={handleClosePostModal}
          post={selectedPost}
        />
      </main>
    </div>
  );
}

export default App;
