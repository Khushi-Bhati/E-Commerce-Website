import mongoose from "mongoose";

const Sellerschema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        mobileno: {
            type: String,
            require: true,
            unique: true,
        },
        address:
        {
            type: String,
            required: true,
        },
        profileimg:{
            type:String,
            required:true,


        },


        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        }



    },
    {
        timestamps: true,
    }
)

export const Sellermodel = mongoose.model("seller", Sellerschema)