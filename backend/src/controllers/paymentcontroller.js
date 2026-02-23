import mongoose from "mongoose";
import { Ordermodel } from "../models/Ordermodel.js";
import { Paymentmodel } from "../models/Paymentmodel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51MockStripeKey12345");

const normalizeId = (value) => (value || "").toString().replace(/"/g, "").trim();

const createPaymentController = async (req, res) => {
    try {
        const orderId = normalizeId(req.body.orderId);
        const buyerId = normalizeId(req.body.buyerId);
        const sellerId = normalizeId(req.body.sellerId);
        const amount = Number(req.body.amount || 0);
        const method = req.body.method || "cod";
        const transactionId = req.body.transactionId || "";

        if (!orderId || !buyerId || !sellerId || amount <= 0) {
            return res.status(400).send({
                message: "orderId, buyerId, sellerId and amount are required",
                status: "notsuccess"
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !mongoose.Types.ObjectId.isValid(buyerId) ||
            !mongoose.Types.ObjectId.isValid(sellerId)
        ) {
            return res.status(400).send({
                message: "Invalid IDs in request",
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

        const payment = await Paymentmodel.create({
            orderId,
            buyerId,
            sellerId,
            amount,
            method,
            transactionId,
            status: "success"
        });

        order.paymentStatus = "paid";
        await order.save();

        return res.status(201).send({
            message: "Payment recorded successfully",
            status: "success",
            payment
        });
    } catch (error) {
        return res.status(500).send({
            message: `create payment error: ${error}`,
            status: "failed"
        });
    }
};

const getSellerPaymentsController = async (req, res) => {
    try {
        const sellerId = normalizeId(req.params.sellerId);
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Valid sellerId is required",
                status: "notsuccess"
            });
        }

        const payments = await Paymentmodel.find({ sellerId })
            .populate("buyerId", "name email")
            .populate("orderId", "orderNumber totalAmount status paymentStatus")
            .sort({ createdAt: -1 });

        return res.status(200).send({
            message: "Payments fetched successfully",
            status: "success",
            payments
        });
    } catch (error) {
        return res.status(500).send({
            message: `get seller payments error: ${error}`,
            status: "failed"
        });
    }
};

const updatePaymentStatusController = async (req, res) => {
    try {
        const paymentId = normalizeId(req.params.paymentId);
        const { status } = req.body;

        if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).send({
                message: "Valid paymentId is required",
                status: "notsuccess"
            });
        }

        const payment = await Paymentmodel.findById(paymentId);
        if (!payment) {
            return res.status(404).send({
                message: "Payment not found",
                status: "notsuccess"
            });
        }

        if (status) {
            payment.status = status;
        }
        await payment.save();

        return res.status(200).send({
            message: "Payment updated successfully",
            status: "success",
            payment
        });
    } catch (error) {
        return res.status(500).send({
            message: `update payment status error: ${error}`,
            status: "failed"
        });
    }
};

const createStripeSession = async (req, res) => {
    try {
        const { paymentDetails, totalAmount } = req.body;

        const lineItems = [{
            price_data: {
                currency: 'inr',
                product_data: {
                    name: 'Easeincart Order',
                    description: `Payment for ${paymentDetails.length} order(s)`
                },
                unit_amount: Math.round(totalAmount * 100), // Stripe expects amounts in smallest currency unit (paise)
            },
            quantity: 1,
        }];

        const origin = process.env.CORS_ORIGIN || "http://localhost:3000";
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${origin}/customer/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/customer/cart`,
        });

        res.status(200).json({ status: "success", id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ status: "failed", message: error.message });
    }
};

const verifyStripeSession = async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            res.status(200).json({ status: "success", payment_status: session.payment_status });
        } else {
            res.status(400).json({ status: "failed", message: "Payment not completed" });
        }
    } catch (error) {
        res.status(500).json({ status: "failed", message: error.message });
    }
};

export {
    createPaymentController,
    getSellerPaymentsController,
    updatePaymentStatusController,
    createStripeSession,
    verifyStripeSession
};
