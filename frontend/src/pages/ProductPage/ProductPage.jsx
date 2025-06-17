import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  fetchProducts,
  fetchReviews,
  fetchRatings,
  fetchAverageRating,
  fetchTags,
  addReview,
  addRating,
} from "../../services/api";
import { uploadToCloudinary } from "../../services/cloudinary/cloudinaryService";
import "./ProductPage.css";

const ProductPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const userId = new URLSearchParams(location.search).get("userId");

  const [product, setProduct] = useState(null);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [tags, setTags] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [formMessage, setFormMessage] = useState({
    text: "",
    type: "", // "error", "success", or "warning"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUserRated, setHasUserRated] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsData = await fetchProducts();
        const selectedProduct = productsData.find(
          (p) => p.id === parseInt(productId)
        );
        setProduct(selectedProduct);

        const averageRatingData = await fetchAverageRating(productId);
        const tagsData = await fetchTags(productId);

        setAverageRating(averageRatingData.average_rating);
        setTags(tagsData.tags);
      } catch (error) {
        console.error("Error loading product data:", error);
      }
    };
    loadData();
  }, [productId]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (userId) {
          const reviewsData = await fetchReviews(productId);
          const ratingsData = await fetchRatings(productId);

          // Check if user has already rated or reviewed
          const userRating = ratingsData.find(
            (rating) => rating.user_id === parseInt(userId)
          );
          const userReview = reviewsData.find(
            (review) => review.user_id === parseInt(userId)
          );

          setHasUserRated(!!userRating);
          setHasUserReviewed(!!userReview);

          // Combine ratings and reviews
          const allFeedback = [];

          // Add ratings with no reviews
          ratingsData.forEach((rating) => {
            const hasReview = reviewsData.some(
              (review) => review.user_id === rating.user_id
            );
            if (!hasReview) {
              allFeedback.push({
                id: `rating-${rating.id}`,
                user: rating.user,
                rating: rating.rating,
                review_text: null,
                image_url: null,
                created_at: rating.created_at,
              });
            }
          });

          // Add reviews (with ratings if available)
          reviewsData.forEach((review) => {
            const matchingRating = ratingsData.find(
              (rating) => rating.user_id === review.user_id
            );
            allFeedback.push({
              id: `review-${review.id}`,
              user: review.user,
              rating: matchingRating ? matchingRating.rating : null,
              review_text: review.review_text,
              image_url: review.image_url,
              created_at: review.created_at,
            });
          });

          // Sort by created_at date (newest first)
          allFeedback.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          setFeedbackItems(allFeedback);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setFormMessage({
          text: "Error loading feedback data. Please refresh the page.",
          type: "error",
        });
      }
    };
    loadUserData();
  }, [userId, productId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview for the first image
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Using the cloudinaryService for image upload

  const handleSubmit = async () => {
    // Clear any previous messages
    setFormMessage({ text: "", type: "" });

    // Form validation
    if (!newReview.trim() && (!newRating || newRating < 1 || newRating > 5)) {
      setFormMessage({
        text: "Please enter a valid rating between 1 and 5 or a non-empty review.",
        type: "error",
      });
      return;
    }

    // Check if user has already rated or reviewed
    if (newRating && hasUserRated) {
      setFormMessage({
        text: "You've already rated this product. You can only submit one rating per product.",
        type: "warning",
      });
      return;
    }

    if (newReview.trim() && hasUserReviewed) {
      setFormMessage({
        text: "You've already reviewed this product. You can only submit one review per product.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    let imageUrl = null;

    // Upload image if selected
    if (selectedFiles.length > 0) {
      try {
        imageUrl = await uploadToCloudinary(selectedFiles[0]);
      } catch (error) {
        console.error("Error uploading image:", error);
        setFormMessage({
          text: "Failed to upload image. Please try again.",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Submit review if provided
    if (newReview.trim()) {
      const reviewData = {
        userId,
        reviewText: newReview,
        imageUrl: imageUrl,
      };

      try {
        const addedReview = await addReview(productId, reviewData);

        // Add to feedback items
        const newFeedbackItem = {
          id: `review-${addedReview.id}`,
          user: { id: parseInt(userId), name: "You" }, // This will be replaced when reloading
          rating: newRating > 0 ? newRating : null,
          review_text: addedReview.review_text,
          image_url: addedReview.image_url,
          created_at: new Date().toISOString(),
        };

        setFeedbackItems([newFeedbackItem, ...feedbackItems]);
        setHasUserReviewed(true);

        setFormMessage({
          text: "Your review has been submitted successfully!",
          type: "success",
        });
      } catch (error) {
        console.error("Error adding review:", error);

        // Check if it's a duplicate review error
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.error === "User has already reviewed this product"
        ) {
          setFormMessage({
            text: "You've already reviewed this product. You can only submit one review per product.",
            type: "warning",
          });
        } else {
          setFormMessage({
            text: "Failed to submit review. Please try again.",
            type: "error",
          });
        }

        setIsSubmitting(false);
        return;
      }
    }

    // Submit rating if provided
    if (newRating && newRating >= 1 && newRating <= 5) {
      const ratingData = { userId, rating: newRating };

      try {
        await addRating(productId, ratingData);

        // If we only added a rating (no review), add it to feedback items
        if (!newReview.trim()) {
          const newFeedbackItem = {
            id: `rating-${Date.now()}`, // Temporary ID
            user: { id: parseInt(userId), name: "You" }, // This will be replaced when reloading
            rating: newRating,
            review_text: null,
            image_url: null,
            created_at: new Date().toISOString(),
          };

          setFeedbackItems([newFeedbackItem, ...feedbackItems]);
        }

        setHasUserRated(true);

        // Refresh average rating
        const averageRatingData = await fetchAverageRating(productId);
        setAverageRating(averageRatingData.average_rating);

        if (!newReview.trim()) {
          setFormMessage({
            text: "Your rating has been submitted successfully!",
            type: "success",
          });
        }
      } catch (error) {
        console.error("Error adding rating:", error);

        // Check if it's a duplicate rating error
        if (
          error.response &&
          error.response.status === 400 &&
          error.response.data.error === "User has already rated this product"
        ) {
          setFormMessage({
            text: "You've already rated this product. You can only submit one rating per product.",
            type: "warning",
          });
        } else if (!newReview.trim()) {
          // Only show error if we didn't already show a review success
          setFormMessage({
            text: "Failed to submit rating. Please try again.",
            type: "error",
          });
        }

        if (!newReview.trim()) {
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Reset form
    setNewReview("");
    setNewRating(0);
    setSelectedFiles([]);
    setPreviewImage(null);
    setIsSubmitting(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "filled" : ""}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleStarClick = (value) => {
    setNewRating(value);
  };

  const openModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="product-container">
      {product ? (
        <>
          <div className="product-header">
            <div className="product-image-container">
              <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
              />
            </div>
            <div className="product-info">
              <h1 className="product-name">{product.name}</h1>
              <p className="product-description">{product.description}</p>

              <div className="product-rating">
                <h2 className="rating-title">
                  Average Rating:{" "}
                  <span className="rating-value">
                    {averageRating !== null && !isNaN(Number(averageRating)) ? (
                      <>
                        {Number(averageRating).toFixed(1)}
                        <div className="stars-display">
                          {renderStars(Math.round(Number(averageRating)))}
                        </div>
                      </>
                    ) : (
                      "No ratings yet"
                    )}
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <div className="product-tags">
            <h2>Tags</h2>
            {tags.length > 0 ? (
              <ul className="tags-list">
                {tags.map((tag, index) => (
                  <li key={index} className="tag-item">
                    #{tag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No tags yet</p>
            )}
          </div>

          <div className="section">
            <h2>Ratings & Reviews</h2>
            {feedbackItems.length > 0 ? (
              <ul className="feedback-list">
                {feedbackItems.map((item) => (
                  <li key={item.id} className="feedback-item">
                    <div className="feedback-header">
                      {item.rating && (
                        <div className="stars-display">
                          {renderStars(item.rating)}
                        </div>
                      )}
                      <span className="feedback-user">
                        by{" "}
                        {item.user?.username || item.user?.name || "Anonymous"}
                      </span>
                    </div>

                    {item.review_text && (
                      <p className="feedback-text">"{item.review_text}"</p>
                    )}

                    {item.image_url && (
                      <div className="review-images-container">
                        <img
                          src={item.image_url}
                          alt="Review"
                          className="review-image"
                          onClick={() => openModal(item.image_url)}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No ratings or reviews yet</p>
            )}
          </div>

          <div className="section form-section">
            <h3>Add Your Feedback</h3>
            <div className="rating-review-form">
              <div className="form-group">
                <label htmlFor="rating">Your Rating</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      onClick={() => handleStarClick(value)}
                      className={value <= newRating ? "filled" : ""}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review">Your Review (optional)</label>
                <textarea
                  id="review"
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Write your review here..."
                  className="review-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Add Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="image-upload"
                />

                {previewImage && (
                  <div className="upload-preview">
                    <img
                      src={previewImage}
                      alt="Upload preview"
                      className="preview-image"
                    />
                  </div>
                )}
              </div>

              {formMessage.text && (
                <div className={`form-message ${formMessage.type}`}>
                  {formMessage.text}
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </div>

          {/* Image Modal */}
          {modalImage && (
            <div className="modal" onClick={closeModal}>
              <span className="close-btn" onClick={closeModal}>
                &times;
              </span>
              <img src={modalImage} alt="Full size" className="modal-content" />
            </div>
          )}
        </>
      ) : (
        <p>Loading product details...</p>
      )}
    </div>
  );
};

export default ProductPage;
