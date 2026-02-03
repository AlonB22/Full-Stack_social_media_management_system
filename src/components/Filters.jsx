/*
  ===========================================
  FILTERS COMPONENT
  ===========================================
  
  This is the white box with all the search and filter options:
  - Search box (no label, just placeholder)
  - Category dropdown (no label)
  - Date From (with label)
  - Date To (with label)
  - Sort By (with label)
  - Apply Filters button (blue)
  - Clear All button (gray)
  
  "State" in React is like the app's memory. When you type in the
  search box, we save what you typed so we can use it later.
*/

import './Filters.css';

function Filters({ 
  filters,           // Current filter values
  onFilterChange,    // Function to call when a filter changes
  onApplyFilters,    // Function to call when "Apply Filters" is clicked
  onClearFilters,    // Function to call when "Clear All" is clicked
  categories         // List of category options
}) {
  
  // This function runs every time you type or select something
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Tell the parent component that a filter changed
    onFilterChange(name, value);
  };

  return (
    <section className="filters-section" aria-label="Filter posts">
      <div className="filters-container">
        {/* Search Input - With label, no icon */}
        <div className="filter-group">
          <label htmlFor="search" className="filter-label">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            className="filter-input"
            placeholder="Search posts..."
            value={filters.search}
            onChange={handleChange}
            aria-label="Search posts"
          />
        </div>

        {/* Category Dropdown - With label, empty default */}
        <div className="filter-group">
          <label htmlFor="category" className="filter-label">Category</label>
          <select
            id="category"
            name="category"
            className="filter-select"
            value={filters.category}
            onChange={handleChange}
          >
            <option value=""></option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date From - With label, empty by default */}
        <div className="filter-group">
          <label htmlFor="dateFrom" className="filter-label">Date From</label>
          <input
            type="date"
            id="dateFrom"
            name="dateFrom"
            className="filter-input"
            value={filters.dateFrom}
            onChange={handleChange}
          />
        </div>

        {/* Date To - With label, empty by default */}
        <div className="filter-group">
          <label htmlFor="dateTo" className="filter-label">Date To</label>
          <input
            type="date"
            id="dateTo"
            name="dateTo"
            className="filter-input"
            value={filters.dateTo}
            onChange={handleChange}
          />
        </div>

        {/* Sort By Dropdown - With label, empty default */}
        <div className="filter-group">
          <label htmlFor="sortBy" className="filter-label">Sort By</label>
          <select
            id="sortBy"
            name="sortBy"
            className="filter-select"
            value={filters.sortBy}
            onChange={handleChange}
          >
            <option value=""></option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostCommented">Most Commented</option>
          </select>
        </div>
      </div>

      {/* Filter Action Buttons */}
      <div className="filter-actions">
        <button 
          className="btn btn-primary"
          onClick={onApplyFilters}
        >
          Apply Filters
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onClearFilters}
        >
          Clear All
        </button>
      </div>
    </section>
  );
}

export default Filters;

