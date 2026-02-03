# Social Media Posts Dashboard

##  Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Git**

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/scripts/activate  # Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Data Initialization
The project uses a SQLite database populated from a CSV file.
```bash
# Run the data processing script to clean data and create the DB
python data_processing.py
```
*Note: Ensure `social_media_posts_data.csv` is located in the root directory (one level up from backend).*

### 4. Frontend Setup
```bash
# Navigate to the root directory
cd ..

# Install dependencies
npm install
```

---

##  How to Run the Application

### 1. Start the Backend API
```bash
cd backend
python app.py
```
The API will be available at `http://localhost:5000`.

### 2. Start the Frontend Development Server
```bash
# In a new terminal tab
npm run dev
```
Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

---

##  Environment Variables

The application uses standard defaults for development. No `.env` file is strictly required for local setup, but the following configurations are used:

- **Frontend:**
  - `API_BASE_URL`: Hardcoded to `http://localhost:5000/api` in `src/services/api.js`.
- **Backend:**
  - `PORT`: Defaulted to `5000`.
  - `DB_PATH`: Points to `backend/social_media.db`.

---

##  Features Added
- **Interactive Dashboard:** View total stats (likes, comments, engagement).
- **Advanced Filtering:** Search by author name or content, filter by category and date.
- **Post Details Modal:** Click any post to see its full content and large-scale visuals.
- **Full CRUD:**
  - **Create:** Add new posts (automatically assigned to **Sys Admin**).
  - **Edit:** Modify description and category via a floating window.
  - **Delete:** Remove posts with a custom confirmation modal.
- **Responsive Design:** Optimized for both desktop and mobile viewing.