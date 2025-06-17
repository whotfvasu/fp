import pool from "../config/db.js";

//add review
export const addReview = async (req, res) => {
  const { productId } = req.params;
  const { userId, reviewText, imageUrl } = req.body;

  try {

    const existingReview = await pool.query(
      "SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2",
      [productId, userId]
    );

    if (existingReview.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User has already reviewed this product" });
    }

    const result = await pool.query(
      "INSERT INTO reviews (product_id, user_id, review_text, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [productId, userId, reviewText, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("error adding review: ", error);
    res.status(500).json({ error: "failed to add review" });
  }
};


export const getReviewsByProductId = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM reviews WHERE product_id = $1",
      [productId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("error fetching reviews: ", error);
    res.status(500).json({ error: "failed to fetch reviews" });
  }
};

export const generateTags = async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await pool.query(
      "SELECT review_text FROM reviews WHERE product_id = $1",
      [productId]
    );
    const reviews = result.rows.map((row) => row.review_text);
    const wordFrequency = {};
    reviews.forEach((review) => {
      const words = review.toLowerCase().split(/\W+/);
      words.forEach((word) => {
        if (word.length > 3) {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });

    const tags = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    res.status(200).json({ tags });
  } catch (error) {
    console.error("Error generating tags:", error);
    res.status(500).json({ error: "Failed to generate tags" });
  }
};

export const getReviewsByUser = async (req, res) => {
  const { productId, userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM reviews WHERE product_id = $1 AND user_id = $2",
      [productId, userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching reviews by user:", error);
    res.status(500).json({ error: "Failed to fetch reviews by user" });
  }
};
