import express from "express";
import productRoutes from "./productRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import ratingRoutes from "./ratingRoutes.js";
import userRoutes from "./userRoutes.js";

const router = express.Router();

// Use routes
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/ratings", ratingRoutes);
router.use("/users", userRoutes);

export default router;
