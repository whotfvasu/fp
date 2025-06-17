import pool from "../config/db.js";

//add rating
export const addRating = async (req, res) => {
  const { productId } = req.params;
  const { userId, rating } = req.body;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    const existingRating = await pool.query(
      "SELECT * FROM ratings WHERE product_id = $1 AND user_id = $2",
      [productId, userId]
    );

    if (existingRating.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User has already rated this product" });
    }
    const result = await pool.query(
      "INSERT INTO ratings (product_id, user_id, rating) VALUES ($1, $2, $3) RETURNING *",
      [productId, userId, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("error adding rating", error);
    res.status(500).json({ error: "failed to add rating" });
  }
};

//fetch rating
export const getRatingsByProductId = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM ratings WHERE product_id = ($1)",
      [productId]
    );
    res.status(200).json(result.rows);
  } catch {
    console.error("error fetching rating", error);
    res.status(500).json({ error: "failed to fetch ratings" });
  }
};

//fetch average rating for a product
export const getAverageRating = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "SELECT AVG(rating) AS average_rating FROM ratings WHERE product_id = $1",
      [productId]
    );
    res.status(200).json({ average_rating: result.rows[0].average_rating });
  } catch (error) {
    console.error("Error fetching average rating:", error);
    res.status(500).json({ error: "Failed to fetch average rating" });
  }
};

export const getRatingsByUser = async (req, res) => {
  const { productId, userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM ratings WHERE product_id = $1 AND user_id = $2",
      [productId, userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching ratings by user:", error);
    res.status(500).json({ error: "Failed to fetch ratings by user" });
  }
};
