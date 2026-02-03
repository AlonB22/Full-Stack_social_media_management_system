/*
  ===========================================
  STATS CARDS COMPONENT
  ===========================================
  
  These are the 4 white boxes at the top showing:
  - Total Posts: 25,000
  - Total Likes: 1.2M  
  - Total Comments: 324K
  - Avg Engagement: 6.8%
  
  Each card has:
  - A label (like "Total Posts")
  - A big number (like "25,000")
  
  We receive the 'stats' data from the parent component.
  Think of it like getting a list of information to display.
*/

import './StatsCards.css';

// Helper function to format big numbers nicely
// 1200000 becomes "1.2M", 324000 becomes "324K"
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

function StatsCards({ stats }) {
  // Define our 4 stat cards
  // Each card has: label (what it's called), value (the number), isPercentage (is it a %)
  const cards = [
    { label: 'Total Posts', value: stats.totalPosts, isPercentage: false },
    { label: 'Total Likes', value: stats.totalLikes, isPercentage: false },
    { label: 'Total Comments', value: stats.totalComments, isPercentage: false },
    { label: 'Avg Engagement', value: stats.avgEngagement, isPercentage: true },
  ];

  return (
    <section className="stats-section" aria-label="Statistics overview">
      <div className="stats-grid">
        {/* 
          .map() is like a loop - it goes through each card and creates HTML for it
          Think of it like: "for each card in the list, make a box"
        */}
        {cards.map((card) => (
          <article key={card.label} className="stat-card">
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">
              {card.isPercentage 
                ? `${card.value}%`  // If it's a percentage, add % at the end
                : formatNumber(card.value)  // Otherwise, format the number
              }
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default StatsCards;

