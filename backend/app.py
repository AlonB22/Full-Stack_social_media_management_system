"""
===========================================
BACKEND API - Flask Application
===========================================

This is the backend server that:
1. Connects to the SQLite database
2. Provides API endpoints for the frontend
3. Handles all CRUD operations (Create, Read, Update, Delete)

Think of it like a waiter in a restaurant:
- Frontend (customer) asks for something
- Backend (waiter) goes to the kitchen (database)
- Backend brings back what was requested

API Endpoints:
- GET  /api/posts         - Get all posts (with filtering/pagination)
- GET  /api/posts/:id     - Get a single post
- POST /api/posts         - Create a new post
- PUT  /api/posts/:id     - Update a post
- DELETE /api/posts/:id   - Delete a post
- GET  /api/stats         - Get statistics
- GET  /api/categories    - Get all categories
- GET  /api/authors       - Get all authors
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

# ===========================================
# CONFIGURATION
# ===========================================

# Create Flask app
app = Flask(__name__)

# Enable CORS (allows frontend on different port to access API)
# This is like giving the frontend a "permission slip" to talk to us
CORS(app)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'social_media.db')

# ===========================================
# DATABASE HELPER FUNCTIONS
# ===========================================

def get_db_connection():
    """
    Create a connection to the SQLite database.
    
    row_factory = sqlite3.Row makes it so we can access columns by name
    instead of by number. Like saying row['name'] instead of row[0].
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def dict_from_row(row):
    """Convert a sqlite3.Row to a dictionary."""
    if row is None:
        return None
    return dict(row)


def init_db():
    """
    Initialize the database if it doesn't exist.
    This creates the schema automatically when the app starts.
    """
    if not os.path.exists(DB_PATH):
        print("[WARNING] Database not found. Please run data_processing.py first!")
        return False
    return True


# ===========================================
# API ENDPOINTS
# ===========================================

# -------------------------------------------
# GET /api/stats - Get dashboard statistics
# -------------------------------------------
@app.route('/api/stats', methods=['GET'])
def get_stats():
    """
    Returns statistics for the dashboard:
    - Total posts
    - Total likes
    - Total comments
    - Average engagement rate
    
    Example response:
    {
        "totalPosts": 25000,
        "totalLikes": 1200000,
        "totalComments": 324000,
        "avgEngagement": 6.8
    }
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get total posts
        cursor.execute('SELECT COUNT(*) as count FROM posts')
        total_posts = cursor.fetchone()['count']
        
        # Get total likes
        cursor.execute('SELECT SUM(likes) as total FROM posts')
        total_likes = cursor.fetchone()['total'] or 0
        
        # Get total comments
        cursor.execute('SELECT SUM(comments) as total FROM posts')
        total_comments = cursor.fetchone()['total'] or 0
        
        # Get average engagement rate
        cursor.execute('SELECT AVG(engagement_rate) as avg FROM posts')
        avg_engagement = cursor.fetchone()['avg'] or 0
        
        conn.close()
        
        return jsonify({
            'totalPosts': total_posts,
            'totalLikes': total_likes,
            'totalComments': total_comments,
            'avgEngagement': round(avg_engagement, 1)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# GET /api/categories - Get all categories
# -------------------------------------------
@app.route('/api/categories', methods=['GET'])
def get_categories():
    """
    Returns a list of all unique categories.
    
    Example response:
    ["Technology", "Product", "Business", "Marketing", "Industry Insights"]
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DISTINCT category 
            FROM posts 
            WHERE category IS NOT NULL AND category != ''
            ORDER BY category
        ''')
        
        categories = [row['category'] for row in cursor.fetchall()]
        conn.close()
        
        return jsonify(categories)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# GET /api/posts - Get posts with filtering
# -------------------------------------------
@app.route('/api/posts', methods=['GET'])
def get_posts():
    """
    Returns a list of posts with optional filtering, sorting, and pagination.
    
    Query parameters:
    - search: Search in post text and author name
    - category: Filter by category
    - dateFrom: Filter posts from this date
    - dateTo: Filter posts until this date
    - sortBy: Sort order (newest, oldest, mostLiked, mostCommented)
    - page: Page number (default: 1)
    - limit: Posts per page (default: 10)
    
    Example: /api/posts?category=Technology&sortBy=mostLiked&page=1&limit=10
    """
    try:
        # Get query parameters
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        date_from = request.args.get('dateFrom', '').strip()
        date_to = request.args.get('dateTo', '').strip()
        sort_by = request.args.get('sortBy', 'newest').strip()
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Build the query dynamically
        query = '''
            SELECT 
                p.id,
                p.text,
                p.date,
                p.likes,
                p.comments,
                p.shares,
                p.total_engagements,
                p.engagement_rate,
                p.image_svg,
                p.category,
                p.location,
                a.id as author_id,
                a.first_name,
                a.last_name,
                a.email,
                a.company,
                a.job_title,
                a.bio,
                a.follower_count,
                a.verified
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE 1=1
        '''
        params = []
        
        # Add search filter
        if search:
            query += ' AND (p.text LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ? OR (a.first_name || " " || a.last_name) LIKE ?)'
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param, search_param])
        
        # Add category filter
        if category:
            query += ' AND p.category = ?'
            params.append(category)
        
        # Add date filters
        if date_from:
            query += ' AND p.date >= ?'
            params.append(date_from)
        
        if date_to:
            query += ' AND p.date <= ?'
            params.append(date_to + ' 23:59:59')
        
        # Add sorting
        if sort_by == 'oldest':
            query += ' ORDER BY p.date ASC'
        elif sort_by == 'mostLiked':
            query += ' ORDER BY p.likes DESC'
        elif sort_by == 'mostCommented':
            query += ' ORDER BY p.comments DESC'
        else:  # newest (default)
            query += ' ORDER BY p.date DESC'
        
        # Get total count (for pagination)
        count_query = query.replace(
            'SELECT \n                p.id,', 
            'SELECT COUNT(*) as count FROM (SELECT p.id'
        ) + ') as subquery'
        
        # Simpler count query
        count_query = '''
            SELECT COUNT(*) as count
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE 1=1
        '''
        count_params = []
        
        if search:
            count_query += ' AND (p.text LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ? OR (a.first_name || " " || a.last_name) LIKE ?)'
            count_params.extend([f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%'])
        if category:
            count_query += ' AND p.category = ?'
            count_params.append(category)
        if date_from:
            count_query += ' AND p.date >= ?'
            count_params.append(date_from)
        if date_to:
            count_query += ' AND p.date <= ?'
            count_params.append(date_to + ' 23:59:59')
        
        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()['count']
        
        # Add pagination
        offset = (page - 1) * limit
        query += ' LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        # Execute main query
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        # Get tags for each post
        posts = []
        for row in rows:
            post = dict_from_row(row)
            
            # Get tags for this post
            cursor.execute(
                'SELECT tag FROM post_tags WHERE post_id = ?',
                (post['id'],)
            )
            tags = [t['tag'] for t in cursor.fetchall()]
            
            # Format the post for frontend
            posts.append({
                'id': post['id'],
                'author': {
                    'id': post['author_id'],
                    'name': f"{post['first_name']} {post['last_name']}",
                    'firstName': post['first_name'],
                    'lastName': post['last_name'],
                    'email': post['email'],
                    'company': post['company'],
                    'title': post['job_title'],
                    'bio': post['bio'],
                    'followerCount': post['follower_count'],
                    'verified': bool(post['verified'])
                },
                'content': post['text'],
                'date': post['date'],
                'likes': post['likes'],
                'comments': post['comments'],
                'shares': post['shares'],
                'totalEngagements': post['total_engagements'],
                'engagementRate': post['engagement_rate'],
                'image': post['image_svg'],
                'category': post['category'],
                'location': post['location'],
                'tags': tags
            })
        
        conn.close()
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit  # Ceiling division
        
        return jsonify({
            'posts': posts,
            'pagination': {
                'currentPage': page,
                'totalPages': total_pages,
                'totalPosts': total_count,
                'postsPerPage': limit,
                'hasNext': page < total_pages,
                'hasPrev': page > 1
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# GET /api/posts/:id - Get a single post
# -------------------------------------------
@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """
    Returns a single post by ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                p.*,
                a.first_name,
                a.last_name,
                a.email,
                a.company,
                a.job_title,
                a.bio,
                a.follower_count,
                a.verified
            FROM posts p
            JOIN authors a ON p.author_id = a.id
            WHERE p.id = ?
        ''', (post_id,))
        
        row = cursor.fetchone()
        
        if row is None:
            conn.close()
            return jsonify({'error': 'Post not found'}), 404
        
        post = dict_from_row(row)
        
        # Get tags
        cursor.execute('SELECT tag FROM post_tags WHERE post_id = ?', (post_id,))
        tags = [t['tag'] for t in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({
            'id': post['id'],
            'author': {
                'name': f"{post['first_name']} {post['last_name']}",
                'email': post['email'],
                'company': post['company'],
                'title': post['job_title'],
                'bio': post['bio'],
                'followerCount': post['follower_count'],
                'verified': bool(post['verified'])
            },
            'content': post['text'],
            'date': post['date'],
            'likes': post['likes'],
            'comments': post['comments'],
            'shares': post['shares'],
            'image': post['image_svg'],
            'category': post['category'],
            'location': post['location'],
            'tags': tags
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# POST /api/posts - Create a new post
# -------------------------------------------
@app.route('/api/posts', methods=['POST'])
def create_post():
    """
    Creates a new post.
    
    Request body (JSON):
    {
        "authorEmail": "john@example.com",
        "content": "Post text here",
        "category": "Technology",
        "location": "New York, NY",
        "tags": ["#tech", "#innovation"]
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('authorEmail'):
            return jsonify({'error': 'Author email is required'}), 400
        if not data.get('content'):
            return jsonify({'error': 'Content is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Find the author by email
        cursor.execute('SELECT id FROM authors WHERE email = ?', (data['authorEmail'],))
        author = cursor.fetchone()
        
        if author is None:
            conn.close()
            return jsonify({'error': 'Author not found'}), 404
        
        author_id = author['id']
        
        # Get the next post ID
        cursor.execute('SELECT MAX(id) as max_id FROM posts')
        max_id = cursor.fetchone()['max_id'] or 0
        new_id = max_id + 1
        
        # Insert the post
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute('''
            INSERT INTO posts (id, author_id, text, date, likes, comments, shares, 
                             total_engagements, engagement_rate, image_svg, category, location)
            VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0.0, ?, ?, ?)
        ''', (
            new_id,
            author_id,
            data.get('content'),
            now,
            data.get('imageSvg', ''),
            data.get('category', ''),
            data.get('location', '')
        ))
        
        # Insert tags
        tags = data.get('tags', [])
        for tag in tags:
            cursor.execute(
                'INSERT INTO post_tags (post_id, tag) VALUES (?, ?)',
                (new_id, tag)
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Post created successfully',
            'id': new_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# PUT /api/posts/:id - Update a post
# -------------------------------------------
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """
    Updates an existing post.
    
    Request body (JSON):
    {
        "content": "Updated text",
        "category": "Business",
        "location": "Los Angeles, CA"
    }
    """
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if post exists
        cursor.execute('SELECT id FROM posts WHERE id = ?', (post_id,))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({'error': 'Post not found'}), 404
        
        # Build update query dynamically
        updates = []
        params = []
        
        if 'content' in data:
            updates.append('text = ?')
            params.append(data['content'])
        
        if 'category' in data:
            updates.append('category = ?')
            params.append(data['category'])
        
        if 'location' in data:
            updates.append('location = ?')
            params.append(data['location'])
        
        if 'imageSvg' in data:
            updates.append('image_svg = ?')
            params.append(data['imageSvg'])
        
        if updates:
            query = f"UPDATE posts SET {', '.join(updates)} WHERE id = ?"
            params.append(post_id)
            cursor.execute(query, params)
        
        # Update tags if provided
        if 'tags' in data:
            # Delete existing tags
            cursor.execute('DELETE FROM post_tags WHERE post_id = ?', (post_id,))
            # Insert new tags
            for tag in data['tags']:
                cursor.execute(
                    'INSERT INTO post_tags (post_id, tag) VALUES (?, ?)',
                    (post_id, tag)
                )
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Post updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# DELETE /api/posts/:id - Delete a post
# -------------------------------------------
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """
    Deletes a post by ID.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if post exists
        cursor.execute('SELECT id FROM posts WHERE id = ?', (post_id,))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({'error': 'Post not found'}), 404
        
        # Delete tags first (foreign key constraint)
        cursor.execute('DELETE FROM post_tags WHERE post_id = ?', (post_id,))
        
        # Delete the post
        cursor.execute('DELETE FROM posts WHERE id = ?', (post_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Post deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------------------
# GET /api/authors - Get all authors
# -------------------------------------------
@app.route('/api/authors', methods=['GET'])
def get_authors():
    """
    Returns a list of all authors.
    Used for the "Add New Post" form dropdown.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, first_name, last_name, email, company, job_title
            FROM authors
            ORDER BY first_name, last_name
            LIMIT 100
        ''')
        
        authors = []
        for row in cursor.fetchall():
            authors.append({
                'id': row['id'],
                'name': f"{row['first_name']} {row['last_name']}",
                'email': row['email'],
                'company': row['company'],
                'title': row['job_title']
            })
        
        conn.close()
        
        return jsonify(authors)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ===========================================
# MAIN - Run the server
# ===========================================

if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("SOCIAL MEDIA POSTS - BACKEND API")
    print("=" * 50)
    
    # Check if database exists
    if init_db():
        print(f"[OK] Database found: {DB_PATH}")
    else:
        print("[WARNING] Run 'python data_processing.py' first to create the database!")
    
    print("\n[SERVER] Starting Flask server...")
    print("[SERVER] API available at: http://localhost:5000")
    print("\nAPI Endpoints:")
    print("  GET    /api/stats        - Dashboard statistics")
    print("  GET    /api/categories   - List of categories")
    print("  GET    /api/posts        - List posts (with filters)")
    print("  GET    /api/posts/:id    - Get single post")
    print("  POST   /api/posts        - Create new post")
    print("  PUT    /api/posts/:id    - Update post")
    print("  DELETE /api/posts/:id    - Delete post")
    print("  GET    /api/authors      - List of authors")
    print("\n" + "=" * 50 + "\n")
    
    # Run the server
    # debug=True means it auto-restarts when you change code
    # host='0.0.0.0' makes it accessible from other devices
    app.run(debug=True, host='0.0.0.0', port=5000)
