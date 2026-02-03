"""
===========================================
DATA PROCESSING & DATABASE DESIGN
===========================================

This script does 3 things:
1. READS the corrupted CSV file
2. CLEANS the data (fixes all the problems)
3. IMPORTS into a normalized SQLite database

Think of it like:
- Reading a messy notebook
- Fixing all the spelling mistakes
- Organizing into neat filing cabinets

Author: Data Processing Script for Social Media Posts
"""

import csv
import sqlite3
import json
import re
import os
from datetime import datetime

# ===========================================
# CONFIGURATION
# ===========================================

# Path to the CSV file (relative to this script)
CSV_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'social_media_posts_data.csv')
# Path to the SQLite database
DB_FILE = os.path.join(os.path.dirname(__file__), 'social_media.db')

# ===========================================
# DATA CLEANING FUNCTIONS
# ===========================================

def clean_boolean(value):
    """
    Fix inconsistent boolean values.
    
    Problem: The CSV has: true, True, false, False, 0, 1
    Solution: Convert all to Python True/False, then to SQLite 1/0
    
    Examples:
        "true" -> 1
        "True" -> 1
        "1" -> 1
        "false" -> 0
        "False" -> 0
        "0" -> 0
    """
    if value is None:
        return 0
    
    # Convert to string and lowercase for comparison
    str_value = str(value).strip().lower()
    
    # Check for truthy values
    if str_value in ('true', '1', 'yes'):
        return 1
    else:
        return 0


def clean_text(value):
    """
    Clean text fields by:
    - Trimming whitespace
    - Fixing double percent signs (%% -> %)
    - Removing ", extra, commas" at the end
    
    Examples:
        "40%% improvement" -> "40% improvement"
        "Hello, extra, commas" -> "Hello"
    """
    if value is None or value == '':
        return None
    
    text = str(value).strip()
    
    # Fix double percent signs
    text = text.replace('%%', '%')
    
    # Remove ", extra, commas" pattern at the end
    text = re.sub(r',\s*extra,\s*commas\s*$', '', text, flags=re.IGNORECASE)
    
    return text.strip() if text else None


def clean_email(value):
    """
    Clean email addresses by:
    - Trimming whitespace
    - Fixing double @@ signs (e.g., john@@example.com -> john@example.com)
    - Converting to lowercase
    
    Examples:
        "john@@example.com" -> "john@example.com"
        "JOHN@EXAMPLE.COM" -> "john@example.com"
        "  john@example.com  " -> "john@example.com"
    """
    if value is None or value == '':
        return None
    
    email = str(value).strip().lower()
    
    # Fix double @@ signs (replace @@ with @)
    while '@@' in email:
        email = email.replace('@@', '@')
    
    return email if email else None


def clean_integer(value):
    """
    Convert to integer, handling empty/null values.
    
    Examples:
        "123" -> 123
        "" -> 0
        None -> 0
    """
    if value is None or value == '':
        return 0
    
    try:
        return int(float(str(value).strip()))
    except (ValueError, TypeError):
        return 0


def clean_float(value):
    """
    Convert to float, handling empty/null values.
    
    Examples:
        "12.5" -> 12.5
        "" -> 0.0
    """
    if value is None or value == '':
        return 0.0
    
    try:
        return float(str(value).strip())
    except (ValueError, TypeError):
        return 0.0


def clean_datetime(value):
    """
    Parse datetime strings into consistent format.
    
    Examples:
        "2024-07-28 15:20:48" -> "2024-07-28 15:20:48"
    """
    if value is None or value == '':
        return None
    
    try:
        # Parse the datetime
        dt = datetime.strptime(str(value).strip(), '%Y-%m-%d %H:%M:%S')
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except ValueError:
        # Try other common formats
        try:
            dt = datetime.strptime(str(value).strip(), '%Y-%m-%d')
            return dt.strftime('%Y-%m-%d 00:00:00')
        except ValueError:
            return None


def clean_location(value):
    """
    Clean location field, handling null/empty values.
    
    Examples:
        "New York, NY" -> "New York, NY"
        "null" -> None
        "" -> None
    """
    if value is None or value == '' or str(value).strip().lower() == 'null':
        return None
    
    return str(value).strip()


def parse_tags(value):
    """
    Parse JSON array of tags into a Python list.
    
    Examples:
        '["#tech","#AI"]' -> ["#tech", "#AI"]
        '' -> []
    """
    if value is None or value == '':
        return []
    
    try:
        # Parse JSON array
        tags = json.loads(str(value))
        if isinstance(tags, list):
            # Clean each tag and remove duplicates
            cleaned_tags = []
            for tag in tags:
                tag = str(tag).strip()
                if tag and tag not in cleaned_tags:
                    cleaned_tags.append(tag)
            return cleaned_tags
        return []
    except json.JSONDecodeError:
        return []


def clean_header(header):
    """
    Clean column headers by removing trailing spaces.
    
    Examples:
        "author_bio " -> "author_bio"
        "post_text " -> "post_text"
    """
    return header.strip()


# ===========================================
# DATABASE SCHEMA
# ===========================================

def create_database_schema(conn):
    """
    Create the normalized database schema.
    
    We split the data into 3 tables:
    1. AUTHORS - Each author stored once
    2. POSTS - Each post links to an author
    3. POST_TAGS - Each tag is its own row
    
    This is called "normalization" - it's like organizing
    a messy closet into separate drawers for shirts, pants, and socks.
    """
    cursor = conn.cursor()
    
    # Drop existing tables (for fresh start)
    cursor.execute('DROP TABLE IF EXISTS post_tags')
    cursor.execute('DROP TABLE IF EXISTS posts')
    cursor.execute('DROP TABLE IF EXISTS authors')
    
    # ===========================================
    # AUTHORS TABLE
    # ===========================================
    # Each author is stored ONCE, identified by email (unique)
    cursor.execute('''
        CREATE TABLE authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            company TEXT,
            job_title TEXT,
            bio TEXT,
            follower_count INTEGER DEFAULT 0,
            verified INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create index for faster email lookups
    cursor.execute('CREATE INDEX idx_authors_email ON authors(email)')
    
    # ===========================================
    # POSTS TABLE
    # ===========================================
    # Each post links to an author via author_id
    cursor.execute('''
        CREATE TABLE posts (
            id INTEGER PRIMARY KEY,
            author_id INTEGER NOT NULL,
            text TEXT,
            date TEXT,
            likes INTEGER DEFAULT 0,
            comments INTEGER DEFAULT 0,
            shares INTEGER DEFAULT 0,
            total_engagements INTEGER DEFAULT 0,
            engagement_rate REAL DEFAULT 0.0,
            image_svg TEXT,
            category TEXT,
            location TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES authors(id)
        )
    ''')
    
    # Create indexes for common queries
    cursor.execute('CREATE INDEX idx_posts_author ON posts(author_id)')
    cursor.execute('CREATE INDEX idx_posts_category ON posts(category)')
    cursor.execute('CREATE INDEX idx_posts_date ON posts(date)')
    
    # ===========================================
    # POST_TAGS TABLE
    # ===========================================
    # Each tag is stored separately, linked to a post
    cursor.execute('''
        CREATE TABLE post_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            tag TEXT NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(id)
        )
    ''')
    
    # Create index for faster tag searches
    cursor.execute('CREATE INDEX idx_post_tags_post ON post_tags(post_id)')
    cursor.execute('CREATE INDEX idx_post_tags_tag ON post_tags(tag)')
    
    conn.commit()
    print("[OK] Database schema created successfully!")


# ===========================================
# DATA IMPORT
# ===========================================

def import_data(conn, csv_path):
    """
    Read the CSV, clean the data, and import into the database.
    
    This is the main function that does all the work:
    1. Open the CSV file
    2. Read each row
    3. Clean the data
    4. Insert into the right tables
    """
    cursor = conn.cursor()
    
    # Keep track of authors we've already added (by email)
    authors_cache = {}  # email -> author_id
    
    # Statistics for reporting
    stats = {
        'total_rows': 0,
        'authors_created': 0,
        'posts_created': 0,
        'tags_created': 0,
        'issues_fixed': {
            'boolean_inconsistency': 0,
            'double_percent': 0,
            'extra_commas': 0,
            'null_locations': 0,
            'missing_images': 0,
            'duplicate_tags': 0,
            'double_at_emails': 0
        }
    }
    
    print(f"[READ] Reading CSV file: {csv_path}")
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        # Read CSV with header
        reader = csv.DictReader(file)
        
        # Clean headers (remove trailing spaces)
        if reader.fieldnames:
            cleaned_fieldnames = [clean_header(h) for h in reader.fieldnames]
            reader.fieldnames = cleaned_fieldnames
        
        for row in reader:
            stats['total_rows'] += 1
            
            # ===========================================
            # CLEAN THE DATA
            # ===========================================
            
            # Clean author fields
            first_name = clean_text(row.get('author_first_name', ''))
            last_name = clean_text(row.get('author_last_name', ''))
            
            # Clean email (fix double @@ signs)
            raw_email = row.get('author_email', '')
            email = clean_email(raw_email)
            if '@@' in str(raw_email):
                stats['issues_fixed']['double_at_emails'] += 1
            
            company = clean_text(row.get('author_company', ''))
            job_title = clean_text(row.get('author_job_title', ''))
            bio = clean_text(row.get('author_bio', ''))
            follower_count = clean_integer(row.get('author_follower_count', 0))
            
            # Clean boolean (track if we fixed it)
            raw_verified = row.get('author_verified', '')
            verified = clean_boolean(raw_verified)
            if str(raw_verified).lower() not in ('true', 'false', '0', '1', ''):
                stats['issues_fixed']['boolean_inconsistency'] += 1
            
            # Clean post fields
            post_id = clean_integer(row.get('post_id', 0))
            
            # Clean post text (track fixes)
            raw_text = row.get('post_text', '')
            post_text = clean_text(raw_text)
            if '%%' in str(raw_text):
                stats['issues_fixed']['double_percent'] += 1
            if 'extra, commas' in str(raw_text).lower():
                stats['issues_fixed']['extra_commas'] += 1
            
            post_date = clean_datetime(row.get('post_date', ''))
            likes = clean_integer(row.get('likes', 0))
            comments = clean_integer(row.get('comments', 0))
            shares = clean_integer(row.get('shares', 0))
            total_engagements = clean_integer(row.get('total_engagements', 0))
            engagement_rate = clean_float(row.get('engagement_rate', 0))
            
            # Clean image (track missing)
            image_svg = clean_text(row.get('post_image_svg', ''))
            if not image_svg:
                stats['issues_fixed']['missing_images'] += 1
            
            category = clean_text(row.get('post_category', ''))
            
            # Clean location
            raw_location = row.get('location', '')
            location = clean_location(raw_location)
            if str(raw_location).strip().lower() in ('null', ''):
                stats['issues_fixed']['null_locations'] += 1
            
            # Parse tags
            raw_tags = row.get('post_tags', '')
            tags = parse_tags(raw_tags)
            
            # ===========================================
            # INSERT INTO DATABASE
            # ===========================================
            
            # 1. Insert or get author
            if email and email not in authors_cache:
                cursor.execute('''
                    INSERT OR IGNORE INTO authors 
                    (first_name, last_name, email, company, job_title, bio, follower_count, verified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (first_name, last_name, email, company, job_title, bio, follower_count, verified))
                
                # Get the author ID
                cursor.execute('SELECT id FROM authors WHERE email = ?', (email,))
                result = cursor.fetchone()
                if result:
                    authors_cache[email] = result[0]
                    stats['authors_created'] += 1
            
            author_id = authors_cache.get(email, None)
            
            if author_id is None:
                continue  # Skip if no valid author
            
            # 2. Insert post
            cursor.execute('''
                INSERT OR REPLACE INTO posts 
                (id, author_id, text, date, likes, comments, shares, total_engagements, 
                 engagement_rate, image_svg, category, location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (post_id, author_id, post_text, post_date, likes, comments, shares,
                  total_engagements, engagement_rate, image_svg, category, location))
            stats['posts_created'] += 1
            
            # 3. Insert tags
            seen_tags = set()
            for tag in tags:
                if tag not in seen_tags:
                    cursor.execute('''
                        INSERT INTO post_tags (post_id, tag)
                        VALUES (?, ?)
                    ''', (post_id, tag))
                    stats['tags_created'] += 1
                    seen_tags.add(tag)
                else:
                    stats['issues_fixed']['duplicate_tags'] += 1
            
            # Progress indicator
            if stats['total_rows'] % 5000 == 0:
                print(f"  Processed {stats['total_rows']} rows...")
    
    conn.commit()
    
    return stats


def print_report(stats):
    """
    Print a summary report of what was done.
    """
    print("\n" + "=" * 50)
    print("DATA PROCESSING REPORT")
    print("=" * 50)
    
    print(f"\nSUMMARY:")
    print(f"  - Total rows processed: {stats['total_rows']:,}")
    print(f"  - Unique authors created: {stats['authors_created']:,}")
    print(f"  - Posts imported: {stats['posts_created']:,}")
    print(f"  - Tags created: {stats['tags_created']:,}")
    
    print(f"\nDATA ISSUES FIXED:")
    for issue, count in stats['issues_fixed'].items():
        issue_name = issue.replace('_', ' ').title()
        print(f"  - {issue_name}: {count:,}")
    
    print("\n" + "=" * 50)
    print("[OK] Data processing complete!")
    print("=" * 50)


def ensure_sys_admin(conn):
    """
    Ensure the default 'Sys Admin' user exists in the database.
    This guarantees that the hardcoded frontend logic always has a valid user.
    """
    cursor = conn.cursor()
    
    email = "sys.admin@socialmediaposts.com"
    
    cursor.execute("SELECT id FROM authors WHERE email = ?", (email,))
    existing = cursor.fetchone()
    
    if not existing:
        print(f"\n[SETUP] Creating default Sys Admin user ({email})...")
        cursor.execute('''
            INSERT INTO authors (first_name, last_name, email, company, job_title, bio, follower_count, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            "Sys", 
            "Admin", 
            email, 
            "Social Media Posts", 
            "System Administrator", 
            "The default system administrator account.", 
            999999, 
            1
        ))
        conn.commit()
    else:
        print(f"\n[SETUP] Sys Admin user already exists.")

# ===========================================
# MAIN FUNCTION
# ===========================================

def main():
    """
    Main entry point - runs the entire data processing pipeline.
    """
    print("\n" + "=" * 50)
    print("SOCIAL MEDIA POSTS DATA PROCESSOR")
    print("=" * 50)
    
    # Check if CSV file exists
    csv_path = os.path.abspath(CSV_FILE)
    if not os.path.exists(csv_path):
        print(f"[ERROR] CSV file not found at {csv_path}")
        return
    
    print(f"\n[FILE] CSV file: {csv_path}")
    print(f"[DB] Database: {os.path.abspath(DB_FILE)}")
    
    # Create database connection
    conn = sqlite3.connect(DB_FILE)
    
    try:
        # Step 1: Create schema
        print("\n[STEP 1] Creating database schema...")
        create_database_schema(conn)
        
        # Step 2: Import data
        print("\n[STEP 2] Importing and cleaning data...")
        stats = import_data(conn, csv_path)
        
        # Step 3: Ensure Sys Admin exists
        ensure_sys_admin(conn)
        
        # Step 4: Print report
        print_report(stats)
        
    finally:
        conn.close()


if __name__ == '__main__':
    main()

