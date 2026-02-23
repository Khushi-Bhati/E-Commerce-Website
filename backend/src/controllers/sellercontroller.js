import { Sellermodel } from "../models/Sellermodel.js";
import { Usermodel } from "../models/Usermodel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Ordermodel } from "../models/Ordermodel.js";
import { Buyermoddel } from "../models/Buyermodel.js";

const sellerprofilecontroller = async (req, res) => {
    try {
        const { name, address, userID, mobileno } = req.body;

        if (!name || !address || !userID || !mobileno) {
            return res.status(400).send({
                message: "All fields are required",
                status: "notsuccess"
            });
        }

        if ([name, address, userID, mobileno].some((field) => field.trim() === "")) {
            return res.status(400).send({
                message: "Fields cannot be empty",
                status: "notsuccess"
            });
        }

        const profileimgpath = req.files?.profileimg?.[0]?.path;

        if (!profileimgpath) {
            return res.status(400).send({   // Fixed: was res.stat() — runtime crash
                message: "Profile image is required",
                status: "notsuccess",
            });
        }

        const sellerprofileimg = await uploadOnCloudinary(profileimgpath);

        if (!sellerprofileimg?.url) {
            return res.status(500).send({
                message: "Failed to upload profile image",
                status: "failed"
            });
        }

        const user = await Usermodel.findOne({ _id: userID });

        if (!user) {
            return res.status(404).send({
                message: "User not found",
                status: "notsuccess"
            });
        }

        const existingProfile = await Sellermodel.findOne({ userID: user._id });

        if (existingProfile) {
            return res.status(409).send({
                message: "Seller profile already exists",
                status: "notsuccess"
            });
        }

        const profile = await Sellermodel.create({
            name,
            address,
            mobileno,
            profileimg: sellerprofileimg.url,
            userID: user._id
        });

        user.isProfileCreated = true;
        await user.save();

        return res.status(201).send({
            message: "Seller profile created successfully",
            status: "success",
            profile
        });

    } catch (error) {
        return res.status(500).send({
            message: `seller controller error is ${error.message}`,
            status: "failed",
        });
    }
};

const getsellerprofilecontroller = async (req, res) => {
    try {
        const userID = req.params.id;

        const user = await Usermodel.findById(userID);

        if (!user) {
            return res.status(404).send({
                message: "User not found",
                status: "notsuccess"
            });
        }

        if (!user.isProfileCreated) {
            return res.status(404).send({
                message: "Profile not found",
                status: "notsuccess"
            });
        }

        const profile = await Sellermodel.findOne({ userID }).populate("userID", "name email role");

        if (!profile) {
            return res.status(404).send({
                message: "Profile not found",
                status: "notsuccess"
            });
        }

        return res.status(200).send({
            message: "Profile fetched successfully",
            status: "success",
            profile
        });

    } catch (error) {
        return res.status(500).send({
            message: `getsellerprofile error: ${error.message}`,
            status: "failed"
        });
    }
};

const getsellercustomerscontroller = async (req, res) => {
    try {
        const sellerId = (req.params.sellerId || "").toString().replace(/"/g, "").trim();

        if (!sellerId) {
            return res.status(400).send({
                message: "sellerId is required",
                status: "notsuccess"
            });
        }

        const orders = await Ordermodel.find({ sellerId }).select("buyerId");
        const buyerIds = [...new Set(orders.map((order) => order.buyerId.toString()))];

        const customers = await Buyermoddel.find({
            userID: { $in: buyerIds }
        }).populate("userID", "name email");

        return res.status(200).send({
            message: "Seller customers fetched successfully",
            status: "success",
            customers
        });
    } catch (error) {
        return res.status(500).send({
            message: `get seller customers error: ${error.message}`,
            status: "failed"
        });
    }
};

export { sellerprofilecontroller, getsellerprofilecontroller, getsellercustomerscontroller };
