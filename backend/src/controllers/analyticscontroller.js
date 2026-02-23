import mongoose from "mongoose";
import { Ordermodel } from "../models/Ordermodel.js";
import { Paymentmodel } from "../models/Paymentmodel.js";
import { Productmodel } from "../models/Productmodel.js";
import { Reviewmodel } from "../models/Reviewmodel.js";

const normalizeId = (value) => (value || "").toString().replace(/"/g, "").trim();

const getSellerAnalyticsController = async (req, res) => {
    try {
        const sellerId = normalizeId(req.params.sellerId);
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Valid sellerId is required",
                status: "notsuccess"
            });
        }

        const [totalOrders, orders, payments, products, productIds] = await Promise.all([
            Ordermodel.countDocuments({ sellerId }),
            Ordermodel.find({ sellerId }),
            Paymentmodel.find({ sellerId, status: "success" }),
            Productmodel.countDocuments({ sellerID: sellerId }),
            Productmodel.find({ sellerID: sellerId }).select("_id")
        ]);

        const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pendingOrders = orders.filter((o) => o.status === "pending").length;
        const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
        const customerCount = new Set(orders.map((o) => o.buyerId.toString())).size;

        const reviewsCount = await Reviewmodel.countDocuments({
            productId: { $in: productIds.map((p) => p._id) }
        });

        return res.status(200).send({
            message: "Analytics fetched successfully",
            status: "success",
            analytics: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                totalRevenue,
                totalProducts: products,
                totalCustomers: customerCount,
                totalReviews: reviewsCount
            }
        });
    } catch (error) {
        return res.status(500).send({
            message: `get analytics error: ${error}`,
            status: "failed"
        });
    }
};

export { getSellerAnalyticsController };
