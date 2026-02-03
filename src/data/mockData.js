/*
  ===========================================
  MOCK DATA (Fake Data for Testing)
  ===========================================
  
  This is pretend data that we use to test our app before 
  connecting to a real database. Think of it like using 
  toy food to play restaurant before opening a real one!
  
  Later, this will be replaced with real data from a server (backend).
*/

// List of all categories
export const categories = [
  'Technology',
  'Product',
  'Industry Insights',
  'Marketing',
  'Design'
];

// Sample post data that matches the Figma design exactly
export const samplePosts = [
  {
    id: 1,
    author: {
      name: 'John Doe',
      title: 'Software Engineer at TechCorp',
    },
    category: 'Technology',
    content: 'Just launched our new feature and the response has been amazing! Excited to see how this transforms our user experience. Big thanks to the team!',
    date: '2026-01-02',
    likes: 2341,
    comments: 128,
    shares: 2469,
    image: null // Will show gradient
  },
  {
    id: 2,
    author: {
      name: 'Sarah Johnson',
      title: 'Product Manager at InnovateLabs',
    },
    category: 'Product',
    content: "Reflecting on this quarter's achievements and setting goals for the next. Growth mindset is everything! Let's keep pushing boundaries.",
    date: '2025-12-30',
    likes: 1823,
    comments: 94,
    shares: 1917,
    image: null
  },
  {
    id: 3,
    author: {
      name: 'Michael Williams',
      title: 'Data Scientist at DataSystems Inc',
    },
    category: 'Industry Insights',
    content: 'Attended an incredible conference today. The future of technology is bright! So many innovative ideas and brilliant minds in one place.',
    date: '2025-12-28',
    likes: 3456,
    comments: 267,
    shares: 3723,
    image: null
  },
  {
    id: 4,
    author: {
      name: 'Emily Chen',
      title: 'UX Designer at DesignHub',
    },
    category: 'Design',
    content: 'Just finished a complete redesign of our mobile app. User testing results are phenomenal - 40% increase in engagement!',
    date: '2025-12-25',
    likes: 1567,
    comments: 89,
    shares: 1234,
    image: null
  },
  {
    id: 5,
    author: {
      name: 'David Park',
      title: 'Marketing Director at GrowthCo',
    },
    category: 'Marketing',
    content: 'Our latest campaign exceeded all expectations! Key takeaway: authentic storytelling resonates with audiences more than ever.',
    date: '2025-12-22',
    likes: 2890,
    comments: 156,
    shares: 2045,
    image: null
  },
  {
    id: 6,
    author: {
      name: 'Lisa Thompson',
      title: 'CTO at StartupX',
    },
    category: 'Technology',
    content: 'Excited to announce our new AI-powered analytics platform! Months of hard work have paid off. Check out the demo link in bio.',
    date: '2025-12-20',
    likes: 4521,
    comments: 312,
    shares: 3890,
    image: null
  },
  {
    id: 7,
    author: {
      name: 'Alex Rivera',
      title: 'Product Lead at InnoTech',
    },
    category: 'Product',
    content: 'User feedback is gold! Just finished analyzing 500+ responses from our beta users. So many great insights for our next sprint.',
    date: '2025-12-18',
    likes: 1234,
    comments: 78,
    shares: 987,
    image: null
  },
  {
    id: 8,
    author: {
      name: 'Jennifer Kim',
      title: 'Research Analyst at TrendWatch',
    },
    category: 'Industry Insights',
    content: 'New report: Remote work is here to stay. 73% of companies plan to maintain hybrid models. Full analysis on our blog.',
    date: '2025-12-15',
    likes: 3678,
    comments: 234,
    shares: 2901,
    image: null
  },
  {
    id: 9,
    author: {
      name: 'Robert Martinez',
      title: 'Creative Director at PixelPerfect',
    },
    category: 'Design',
    content: 'Minimalism in 2026: Less really is more. Shared my thoughts on the evolution of design trends in my latest article.',
    date: '2025-12-12',
    likes: 2145,
    comments: 167,
    shares: 1876,
    image: null
  }
];

// Aggregated statistics
export const stats = {
  totalPosts: 25000,
  totalLikes: 1200000,
  totalComments: 324000,
  avgEngagement: 6.8
};

// Generate more posts for pagination demo
export function generateMorePosts(count = 50) {
  const authors = [
    { name: 'John Doe', title: 'Software Engineer at TechCorp' },
    { name: 'Sarah Johnson', title: 'Product Manager at InnovateLabs' },
    { name: 'Michael Williams', title: 'Data Scientist at DataSystems Inc' },
    { name: 'Emily Chen', title: 'UX Designer at DesignHub' },
    { name: 'David Park', title: 'Marketing Director at GrowthCo' },
    { name: 'Lisa Thompson', title: 'CTO at StartupX' },
  ];
  
  const contents = [
    'Just launched our new feature and the response has been amazing!',
    'Reflecting on this quarters achievements and setting goals for the next.',
    'Attended an incredible conference today. So many innovative ideas!',
    'User feedback is gold! Just finished analyzing responses from beta users.',
    'Excited to announce our new platform! Months of hard work paid off.',
    'New report: The future of technology is looking brighter than ever.',
  ];
  
  const posts = [...samplePosts];
  
  for (let i = samplePosts.length + 1; i <= count; i++) {
    const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomContent = contents[Math.floor(Math.random() * contents.length)];
    
    // Generate a random date within the last 60 days
    const randomDays = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - randomDays);
    
    posts.push({
      id: i,
      author: randomAuthor,
      category: randomCategory,
      content: randomContent,
      date: date.toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 5000) + 100,
      comments: Math.floor(Math.random() * 300) + 10,
      shares: Math.floor(Math.random() * 4000) + 50,
      image: null
    });
  }
  
  return posts;
}

