import { Buyermoddel } from "../models/Buyermodel.js";
import { Usermodel } from "../models/Usermodel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ── Create buyer profile ───────────────────────────────────────────────────
const buyerprofilecontroller = async (req, res) => {
    try {
        const { name, userID, shippingaddress, mobileno } = req.body;

        if (!name || !userID || !shippingaddress || !mobileno) {
            return res.status(400).send({ message: "All fields are required", status: "notsuccess" });
        }

        if ([name, userID, shippingaddress, mobileno].some((f) => f.trim() === "")) {
            return res.status(400).send({ message: "Fields cannot be empty", status: "notsuccess" });
        }

        const profileimagepath = req.files?.profileimg?.[0]?.path;
        if (!profileimagepath) {
            return res.status(400).send({ message: "Profile image is required", status: "notsuccess" });
        }

        const customerprofileimg = await uploadOnCloudinary(profileimagepath);
        if (!customerprofileimg?.url) {
            return res.status(500).send({ message: "Failed to upload profile image", status: "failed" });
        }

        const user = await Usermodel.findOne({ _id: userID });
        if (!user) {
            return res.status(404).send({ message: "User not found", status: "notsuccess" });
        }

        const existing = await Buyermoddel.findOne({ userID: user._id });
        if (existing) {
            return res.status(409).send({ message: "Buyer profile already exists", status: "notsuccess" });
        }

        const profile = await Buyermoddel.create({
            name,
            shippingaddress: [shippingaddress],
            mobileno,
            profileimg: customerprofileimg.url,
            userID: user._id,
        });

        user.isProfileCreated = true;
        await user.save();

        return res.status(201).send({ message: "Buyer profile created successfully", status: "success", profile });

    } catch (error) {
        return res.status(500).send({ message: `buyer controller error: ${error.message}`, status: "failed" });
    }
};

// ── Update buyer profile ───────────────────────────────────────────────────
const updatebuyerprofilecontroller = async (req, res) => {
    try {
        const { userID, name, shippingaddress, mobileno } = req.body;

        if (!userID || !name || !shippingaddress || !mobileno) {
            return res.status(400).send({ message: "All fields are required", status: "notsuccess" });
        }

        const profile = await Buyermoddel.findOne({ userID });
        if (!profile) {
            return res.status(404).send({ message: "Profile not found", status: "notsuccess" });
        }

        // Only upload a new image if one was actually provided
        let profileimgUrl = profile.profileimg;
        const newImagePath = req.files?.profileimg?.[0]?.path;
        if (newImagePath) {
            const uploaded = await uploadOnCloudinary(newImagePath);
            if (uploaded?.url) profileimgUrl = uploaded.url;
        }

        profile.name = name;
        profile.mobileno = mobileno;
        profile.shippingaddress = [shippingaddress];
        profile.profileimg = profileimgUrl;
        await profile.save();

        return res.status(200).send({ message: "Profile updated successfully", status: "success", profile });

    } catch (error) {
        return res.status(500).send({ message: `update profile error: ${error.message}`, status: "failed" });
    }
};

// ── Get buyer profile ──────────────────────────────────────────────────────
const getbuyerprofilecontroller = async (req, res) => {
    try {
        const userID = req.params.id;

        const user = await Usermodel.findById(userID);
        if (!user) {
            return res.status(404).send({ message: "User not found", status: "notsuccess" });
        }

        const profile = await Buyermoddel.findOne({ userID }).populate("userID", "name email role");

        if (!profile) {
            return res.status(404).send({ message: "Profile not found", status: "notsuccess" });
        }

        return res.status(200).send({ message: "Profile fetched successfully", status: "success", profile });

    } catch (error) {
        return res.status(500).send({ message: `getbuyerprofile error: ${error.message}`, status: "failed" });
    }
};

export { buyerprofilecontroller, updatebuyerprofilecontroller, getbuyerprofilecontroller };