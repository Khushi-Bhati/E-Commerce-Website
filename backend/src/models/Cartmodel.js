import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        }
    },
    { _id: false }
);

const CartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true
        },
        items: {
            type: [CartItemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

export const Cartmodel = mongoose.model("cart", CartSchema);
