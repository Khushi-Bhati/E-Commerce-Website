import mongoose from "mongoose";
import { Productmodel } from "../models/Productmodel.js";
import { Reviewmodel } from "../models/Reviewmodel.js";

const normalizeId = (value) => (value || "").toString().replace(/"/g, "").trim();

const addReviewController = async (req, res) => {
    try {
        const productId = normalizeId(req.body.productId);
        const userId = normalizeId(req.body.userId);
        const rating = Number(req.body.rating || 0);
        const comment = req.body.comment || "";

        if (!productId || !userId || rating < 1 || rating > 5) {
            return res.status(400).send({
                message: "productId, userId and rating(1-5) are required",
                status: "notsuccess"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({
                message: "Invalid productId or userId",
                status: "notsuccess"
            });
        }

        const product = await Productmodel.findById(productId);
        if (!product) {
            return res.status(404).send({
                message: "Product not found",
                status: "notsuccess"
            });
        }

        const review = await Reviewmodel.create({
            productId,
            userId,
            rating,
            comment
        });

        return res.status(201).send({
            message: "Review added successfully",
            status: "success",
            review
        });
    } catch (error) {
        return res.status(500).send({
            message: `add review error: ${error}`,
            status: "failed"
        });
    }
};

const getProductReviewsController = async (req, res) => {
    try {
        const productId = normalizeId(req.params.productId);
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({
                message: "Valid productId is required",
                status: "notsuccess"
            });
        }

        const reviews = await Reviewmodel.find({ productId })
            .populate("userId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            message: "Product reviews fetched successfully",
            status: "success",
            reviews
        });
    } catch (error) {
        return res.status(500).send({
            message: `get product reviews error: ${error}`,
            status: "failed"
        });
    }
};

const getSellerReviewsController = async (req, res) => {
    try {
        const sellerId = normalizeId(req.params.sellerId);
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Valid sellerId is required",
                status: "notsuccess"
            });
        }

        const products = await Productmodel.find({ sellerID: sellerId }).select("_id");
        const productIds = products.map((p) => p._id);

        const reviews = await Reviewmodel.find({ productId: { $in: productIds } })
            .populate("userId", "name email")
            .populate("productId", "productname")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            message: "Seller reviews fetched successfully",
            status: "success",
            reviews
        });
    } catch (error) {
        return res.status(500).send({
            message: `get seller reviews error: ${error}`,
            status: "failed"
        });
    }
};

export {
    addReviewController,
    getProductReviewsController,
    getSellerReviewsController
};
