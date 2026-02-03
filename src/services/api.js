/**
 * ===========================================
 * API SERVICE
 * ===========================================
 * 
 * This file contains all functions to communicate with the backend.
 * Think of it as a "phone" that calls the backend server.
 * 
 * Each function:
 * 1. Makes a request to the backend
 * 2. Waits for the response
 * 3. Returns the data to whoever called it
 */

// The address of our backend server
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Helper function to make API requests.
 * 
 * @param {string} endpoint - The API endpoint (e.g., '/posts')
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - The response data
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }
  
  return response.json();
}

// ===========================================
// STATS API
// ===========================================

/**
 * Get dashboard statistics.
 * 
 * @returns {Promise<{totalPosts, totalLikes, totalComments, avgEngagement}>}
 */
export async function getStats() {
  return fetchAPI('/stats');
}

// ===========================================
// CATEGORIES API
// ===========================================

/**
 * Get all unique categories.
 * 
 * @returns {Promise<string[]>} - Array of category names
 */
export async function getCategories() {
  return fetchAPI('/categories');
}

// ===========================================
// POSTS API
// ===========================================

/**
 * Get posts with optional filters and pagination.
 * 
 * @param {object} params - Query parameters
 * @param {string} params.search - Search text
 * @param {string} params.category - Category filter
 * @param {string} params.dateFrom - Start date
 * @param {string} params.dateTo - End date
 * @param {string} params.sortBy - Sort order
 * @param {number} params.page - Page number
 * @param {number} params.limit - Posts per page
 * @returns {Promise<{posts: Array, pagination: Object}>}
 */
export async function getPosts(params = {}) {
  // Build query string from params
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/posts?${queryString}` : '/posts';
  
  return fetchAPI(endpoint);
}

/**
 * Get a single post by ID.
 * 
 * @param {number} id - Post ID
 * @returns {Promise<Object>} - Post data
 */
export async function getPost(id) {
  return fetchAPI(`/posts/${id}`);
}

/**
 * Create a new post.
 * 
 * @param {object} postData - Post data
 * @param {string} postData.authorEmail - Author's email
 * @param {string} postData.content - Post content
 * @param {string} postData.category - Post category
 * @param {string} postData.location - Post location
 * @param {string[]} postData.tags - Array of hashtags
 * @returns {Promise<{message: string, id: number}>}
 */
export async function createPost(postData) {
  return fetchAPI('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
}

/**
 * Update an existing post.
 * 
 * @param {number} id - Post ID
 * @param {object} postData - Updated post data
 * @returns {Promise<{message: string}>}
 */
export async function updatePost(id, postData) {
  return fetchAPI(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
}

/**
 * Delete a post.
 * 
 * @param {number} id - Post ID
 * @returns {Promise<{message: string}>}
 */
export async function deletePost(id) {
  return fetchAPI(`/posts/${id}`, {
    method: 'DELETE',
  });
}

// ===========================================
// AUTHORS API
// ===========================================

/**
 * Get all authors (for dropdown in Add Post form).
 * 
 * @returns {Promise<Array>} - Array of author objects
 */
export async function getAuthors() {
  return fetchAPI('/authors');
}
