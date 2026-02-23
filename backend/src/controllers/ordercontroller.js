import mongoose from "mongoose";
import { Ordermodel } from "../models/Ordermodel.js";
import { Usermodel } from "../models/Usermodel.js";

const normalizeId = (value) => (value || "").toString().replace(/"/g, "").trim();

const createOrderController = async (req, res) => {
    try {
        const buyerId = normalizeId(req.body.buyerId);
        const sellerId = normalizeId(req.body.sellerId);
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        const totalAmount = Number(req.body.totalAmount || 0);
        const shippingAddress = req.body.shippingAddress || "";

        if (!buyerId || !sellerId || items.length === 0 || totalAmount <= 0) {
            return res.status(400).send({
                message: "buyerId, sellerId, items and totalAmount are required",
                status: "notsuccess"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(buyerId) || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Invalid buyerId or sellerId",
                status: "notsuccess"
            });
        }

        const buyer = await Usermodel.findById(buyerId);
        const seller = await Usermodel.findById(sellerId);
        if (!buyer || !seller) {
            return res.status(404).send({
                message: "Buyer or seller not found",
                status: "notsuccess"
            });
        }

        const order = await Ordermodel.create({
            orderNumber: `ORD-${Date.now()}`,
            buyerId,
            sellerId,
            items,
            totalAmount,
            shippingAddress
        });

        return res.status(201).send({
            message: "Order created successfully",
            status: "success",
            order
        });
    } catch (error) {
        return res.status(500).send({
            message: `create order error: ${error.message}`,
            status: "failed"
        });
    }
};

const getSellerOrdersController = async (req, res) => {
    try {
        const sellerId = normalizeId(req.params.sellerId);
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Valid sellerId is required",
                status: "notsuccess"
            });
        }

        const orders = await Ordermodel.find({ sellerId })
            .populate("buyerId", "name email")
            .populate("items.productId", "productname productimg price discount")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            message: "Orders fetched successfully",
            status: "success",
            orders
        });
    } catch (error) {
        return res.status(500).send({
            message: `get seller orders error: ${error.message}`,
            status: "failed"
        });
    }
};

// NEW: Buyer can view their own orders
const getBuyerOrdersController = async (req, res) => {
    try {
        const buyerId = normalizeId(req.params.buyerId);
        if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
            return res.status(400).send({
                message: "Valid buyerId is required",
                status: "notsuccess"
            });
        }

        const orders = await Ordermodel.find({ buyerId })
            .populate("items.productId", "productname productimg price discount brand")
            .populate("sellerId", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            message: "Buyer orders fetched successfully",
            status: "success",
            orders
        });
    } catch (error) {
        return res.status(500).send({
            message: `get buyer orders error: ${error.message}`,
            status: "failed"
        });
    }
};

const updateOrderStatusController = async (req, res) => {
    try {
        const orderId = normalizeId(req.params.orderId);
        const { status, paymentStatus } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).send({
                message: "Valid orderId is required",
                status: "notsuccess"
            });
        }

        const order = await Ordermodel.findById(orderId);
        if (!order) {
            return res.status(404).send({
                message: "Order not found",
                status: "notsuccess"
            });
        }

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        await order.save();

        return res.status(200).send({
            message: "Order updated successfully",
            status: "success",
            order
        });
    } catch (error) {
        return res.status(500).send({
            message: `update order status error: ${error.message}`,
            status: "failed"
        });
    }
};

export {
    createOrderController,
    getSellerOrdersController,
    getBuyerOrdersController,
    updateOrderStatusController
};
