import mongoose from "mongoose";

const Settingschema = new mongoose.Schema(
    {
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            unique: true
        },
        storeName: {
            type: String,
            default: ""
        },
        storeEmail: {
            type: String,
            default: ""
        },
        storePhone: {
            type: String,
            default: ""
        },
        storeAddress: {
            type: String,
            default: ""
        },
        currency: {
            type: String,
            default: "INR"
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata"
        },
        taxPercentage: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export const Settingmodel = mongoose.model("setting", Settingschema);
