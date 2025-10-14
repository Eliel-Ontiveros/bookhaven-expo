// API configuration
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:3000', 
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    
    // Books
    BOOKS_SEARCH: '/api/books/search',
    BOOK_DETAIL: '/api/books',
    
    // Book Lists
    BOOKLISTS: '/api/booklists',
    
    // Comments
    COMMENTS: '/api/comments',
    
    // Ratings
    RATINGS: '/api/ratings',
    
    // User/Profile
    USER_PROFILE: '/api/users/profile',
    USER_RECOMMENDATIONS: '/api/users/recommendations',
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}