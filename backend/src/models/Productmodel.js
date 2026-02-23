import mongoose from "mongoose";

const Productschema = new mongoose.Schema(
    {
        productname: {
            type: String,
            required: true,
        },
        productimg: [
            {
                type: String,
                required: true,
            }
        ],
        category: {
            type: String,
            required: true,
            enum: [
                "electronics",
                "fashion",
                "home living",
                "beauty",
                "sports",
                "men",
                "women",
                "jewelry",
                "perfume"
            ],
        },
        price: {
            type: String,
            required: true,
        },
        discount: {
            type: String,
        },
        description: {
            type: String,
        },
        stock: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        sellerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    },
    {
        timestamps: true,
    }
);

export const Productmodel = mongoose.model("product", Productschema);
