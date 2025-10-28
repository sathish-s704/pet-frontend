import axios from 'axios';

// Create axios instance with default config
// Read base URL from Vite env var VITE_API_URL. Fallback to '/api' for local/dev setups.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific error cases here
            if (error.response.status === 401) {
                // Handle unauthorized access
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Review-related API methods
const reviews = {
    // Get reviews for a product
    getProductReviews: (productId, page = 1, sortBy = 'createdAt') => 
        api.get(`/reviews/product/${productId}?page=${page}&sortBy=${sortBy}`),
    
    // Get user's reviews
    getMyReviews: (page = 1) => 
        api.get(`/reviews/my-reviews?page=${page}`),
    
    // Create a new review
    createReview: (productId, reviewData) => 
        api.post(`/reviews/product/${productId}`, reviewData),
    
    // Update an existing review
    updateReview: (reviewId, reviewData) => 
        api.put(`/reviews/${reviewId}`, reviewData),
    
    // Delete a review
    deleteReview: (reviewId) => 
        api.delete(`/reviews/${reviewId}`),
    
    // Mark a review as helpful
    markReviewHelpful: (reviewId) => 
        api.post(`/reviews/${reviewId}/helpful`),
    
    // Report a review
    reportReview: (reviewId, reason) => 
        api.post(`/reviews/${reviewId}/report`, { reason })
};

// Attach the reviews object to the api instance
api.reviews = reviews;

export default api;
