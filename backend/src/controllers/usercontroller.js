import { Usermodel } from "../models/Usermodel.js";

const registercontroller = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).send({
                message: "All fields are required",
                status: "notsuccess"
            });
        }

        if ([name, email, password, role].some((field) => field.trim() === "")) {
            return res.status(400).send({
                message: "Fields cannot be empty",
                status: "notsuccess"
            });
        }

        const existingUser = await Usermodel.findOne({ email });
        if (existingUser) {
            return res.status(409).send({
                message: "User already registered",
                status: "notsuccess"
            });
        }

        const user = await Usermodel.create({ email, password, name, role });

        return res.status(201).send({
            message: "User registered successfully",
            status: "success"
        });

    } catch (error) {
        return res.status(500).send({
            message: `register controller error is: ${error.message}`,
            status: 'failed'
        });
    }
};

const logincontroller = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).send({
                message: "All fields are required",
                status: "notsuccess",
            });
        }

        if ([email, password, role].some((field) => field.trim() === "")) {
            return res.status(400).send({
                message: "Fields cannot be empty",
                status: "notsuccess",
            });
        }

        const user = await Usermodel.findOne({ email, role });

        if (!user) {
            return res.status(404).send({
                message: "User not registered",
                status: "notsuccess"
            });
        }

        const matchpassword = await user.isPasswordcorrect(password);

        if (!matchpassword) {
            return res.status(401).send({
                message: "Email or password is incorrect",
                status: "notsuccess"
            });
        }

        const token = await user.generateAccessToken();

        return res.status(200).send({
            message: "User login successfully",
            status: "success",
            token,
            userID: user._id,
            role: user.role,
            isProfileCreated: user.isProfileCreated,
        });

    } catch (error) {
        return res.status(500).send({
            message: `logincontroller error is ${error.message}`,
            status: "failed",
        });
    }
};

const logoutcontroller = async (req, res) => {
    try {
        return res.status(200).send({
            message: "User logged out successfully",
            status: "success"
        });
    } catch (error) {
        return res.status(500).send({
            message: `logout controller error is ${error.message}`,
            status: "failed"
        });
    }
};

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).send({ message: "Email is required", status: "notsuccess" });
        }

        const user = await Usermodel.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            // Return generic message to avoid user enumeration
            return res.status(200).send({
                message: "If that email is registered, a reset link has been generated.",
                status: "success"
            });
        }

        // Generate a cryptographically random token
        const crypto = await import("crypto");
        const rawToken = crypto.randomBytes(32).toString("hex");

        // Store hashed version in DB, send raw version in link
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save({ validateBeforeSave: false });

        const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

        return res.status(200).send({
            message: "Reset link generated successfully.",
            status: "success",
            resetLink  // In production, email this instead of returning it
        });

    } catch (error) {
        return res.status(500).send({
            message: `forgot password error: ${error.message}`,
            status: "failed"
        });
    }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPasswordController = async (req, res) => {
    try {
        const { token, email, newPassword } = req.body;

        if (!token || !email || !newPassword) {
            return res.status(400).send({ message: "All fields are required", status: "notsuccess" });
        }
        if (newPassword.length < 6) {
            return res.status(400).send({ message: "Password must be at least 6 characters", status: "notsuccess" });
        }

        const crypto = await import("crypto");
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await Usermodel.findOne({
            email: email.trim().toLowerCase(),
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).send({ message: "Invalid or expired reset token", status: "notsuccess" });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpiry = null;
        await user.save();

        return res.status(200).send({
            message: "Password reset successfully. You can now log in.",
            status: "success"
        });

    } catch (error) {
        return res.status(500).send({
            message: `reset password error: ${error.message}`,
            status: "failed"
        });
    }
};

export { registercontroller, logincontroller, logoutcontroller, forgotPasswordController, resetPasswordController };
