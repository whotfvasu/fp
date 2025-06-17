import express from "express";
import {
  addReview,
  getReviewsByProductId,
  generateTags,
  getReviewsByUser,
} from "../controllers/reviewController.js";

const router = express.Router();

router.post("/:productId", addReview);
router.get("/:productId", getReviewsByProductId);
router.get("/:productId/tags", generateTags);
router.get("/:productId/user/:userId", getReviewsByUser);

export default router;
