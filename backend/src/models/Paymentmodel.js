import mongoose from "mongoose";

const Paymentschema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order",
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
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        method: {
            type: String,
            enum: ["cod", "upi", "card", "netbanking", "wallet"],
            default: "cod"
        },
        status: {
            type: String,
            enum: ["pending", "success", "failed", "refunded"],
            default: "pending"
        },
        transactionId: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

export const Paymentmodel = mongoose.model("payment", Paymentschema);
