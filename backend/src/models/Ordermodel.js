import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: false }
);

const Orderschema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
            required: true
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            default: []
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending"
        },
        shippingAddress: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

export const Ordermodel = mongoose.model("order", Orderschema);
