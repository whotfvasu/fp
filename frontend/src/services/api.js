import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// fetch all products
export const fetchProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};

// fetch reviews for a product
export const fetchReviews = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/${productId}`);
  const reviews = response.data;

  // get user data for each review
  const userIds = [...new Set(reviews.map((review) => review.user_id))];
  const usersResponse = await axios.get(`${API_BASE_URL}/users`);
  const users = usersResponse.data;

  // add reviews into user data
  return reviews.map((review) => {
    const user = users.find((u) => u.id === review.user_id);
    return {
      ...review,
      user,
    };
  });
};

// fetch ratings for a product
export const fetchRatings = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/ratings/${productId}`);
  const ratings = response.data;

  // Get user data for each rating
  const userIds = [...new Set(ratings.map((rating) => rating.user_id))];
  const usersResponse = await axios.get(`${API_BASE_URL}/users`);
  const users = usersResponse.data;

  // Enrich ratings with user data
  return ratings.map((rating) => {
    const user = users.find((u) => u.id === rating.user_id);
    return {
      ...rating,
      user,
    };
  });
};

// Fetch average rating for a product
export const fetchAverageRating = async (productId) => {
  const response = await axios.get(
    `${API_BASE_URL}/ratings/${productId}/average`
  );
  return response.data;
};

// add a review
export const addReview = async (productId, reviewData) => {
  const { userId, reviewText, imageUrl } = reviewData;
  const response = await axios.post(`${API_BASE_URL}/reviews/${productId}`, {
    userId,
    reviewText,
    imageUrl,
  });
  return response.data;
};

// add a rating
export const addRating = async (productId, ratingData) => {
  const response = await axios.post(
    `${API_BASE_URL}/ratings/${productId}`,
    ratingData
  );
  return response.data;
};

// fetch tags for a product
export const fetchTags = async (productId) => {
  const response = await axios.get(`${API_BASE_URL}/reviews/${productId}/tags`);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};
