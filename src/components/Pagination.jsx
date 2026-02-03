/*
  ===========================================
  PAGINATION COMPONENT
  ===========================================
  
  Pagination is like the pages in a book. Instead of showing
  all 25,000 posts at once (which would be very slow!), we
  show them in smaller groups (pages).
  
  This component shows:
  - "Previous" button to go back
  - Page numbers in a sliding window (shows 5 pages centered around current page)
  - "Next" button to go forward
  
  Props we receive:
  - currentPage: which page we're on right now
  - totalPages: how many pages there are in total
  - onPageChange: function to call when user clicks a page
*/

import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  
  // Don't show pagination if there's only 1 page
  if (totalPages <= 1) {
    return null;
  }
  
  // Show a sliding window of 5 pages centered around current page
  const pageNumbers = [];
  const maxPagesToShow = 5;

  // Calculate the start page for the sliding window
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return (
    <nav className="pagination" aria-label="Pagination navigation">
      {/* Previous Button */}
      <button
        className="pagination-btn pagination-nav"
        onClick={(e) => {
          e.preventDefault();
          onPageChange(currentPage - 1);
        }}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span>Previous</span>
      </button>
      
      {/* Page Numbers: 1, 2, 3, 4, 5 */}
      <div className="pagination-pages">
        {pageNumbers.map((page) => (
          <button
            key={page}
            className={`pagination-btn pagination-page ${currentPage === page ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page);
            }}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>
      
      {/* Next Button */}
      <button
        className="pagination-btn pagination-nav"
        onClick={(e) => {
          e.preventDefault();
          onPageChange(currentPage + 1);
        }}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}

export default Pagination;

