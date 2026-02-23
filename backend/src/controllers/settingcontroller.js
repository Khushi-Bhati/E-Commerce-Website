import mongoose from "mongoose";
import { Settingmodel } from "../models/Settingmodel.js";

const normalizeId = (value) => (value || "").toString().replace(/"/g, "").trim();

const getSellerSettingsController = async (req, res) => {
    try {
        const sellerId = normalizeId(req.params.sellerId);
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Valid sellerId is required",
                status: "notsuccess"
            });
        }

        let settings = await Settingmodel.findOne({ sellerId });
        if (!settings) {
            settings = await Settingmodel.create({ sellerId });
        }

        return res.status(200).send({
            message: "Settings fetched successfully",
            status: "success",
            settings
        });
    } catch (error) {
        return res.status(500).send({
            message: `get settings error: ${error}`,
            status: "failed"
        });
    }
};

const updateSellerSettingsController = async (req, res) => {
    try {
        const sellerId = normalizeId(req.params.sellerId);
        if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).send({
                message: "Valid sellerId is required",
                status: "notsuccess"
            });
        }

        const payload = {
            storeName: req.body.storeName,
            storeEmail: req.body.storeEmail,
            storePhone: req.body.storePhone,
            storeAddress: req.body.storeAddress,
            currency: req.body.currency,
            timezone: req.body.timezone,
            taxPercentage: req.body.taxPercentage
        };

        const settings = await Settingmodel.findOneAndUpdate(
            { sellerId },
            payload,
            { upsert: true, new: true, runValidators: true }
        );

        return res.status(200).send({
            message: "Settings updated successfully",
            status: "success",
            settings
        });
    } catch (error) {
        return res.status(500).send({
            message: `update settings error: ${error}`,
            status: "failed"
        });
    }
};

export { getSellerSettingsController, updateSellerSettingsController };
