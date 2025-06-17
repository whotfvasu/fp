import express from "express";
import {
  addRating,
  getRatingsByProductId,
  getAverageRating,
  getRatingsByUser,
} from "../controllers/ratingController.js";

const router = express.Router();

router.post("/:productId", addRating);
router.get("/:productId", getRatingsByProductId);
router.get("/:productId/average", getAverageRating);
router.get("/:productId/user/:userId", getRatingsByUser);

export default router;
