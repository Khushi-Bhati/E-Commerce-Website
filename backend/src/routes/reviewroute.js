import express from "express";
import {
    addReviewController,
    getProductReviewsController,
    getSellerReviewsController
} from "../controllers/reviewcontroller.js";
import { verifyToken } from "../middlewares/auth.js";

const reviewrouter = express.Router();

// Public: anyone can read reviews
reviewrouter.get("/product/:productId", getProductReviewsController);
reviewrouter.get("/seller/:sellerId", getSellerReviewsController);

// Protected: must be logged in to write a review
reviewrouter.post("/add", verifyToken, addReviewController);

export default reviewrouter;
