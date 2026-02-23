import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const Userschema = new mongoose.Schema(

    {

        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,

        },
        password: {
            type: String,
            required: [true, 'Password is required'],

        },
        role: {
            type: String,
            enum: ['buyer', 'seller', 'admin'],
            default: 'buyer',
        },
        isProfileCreated: {
            type: Boolean,
            default: false,
        },
        resetPasswordToken: {
            type: String,
            default: null,
        },
        resetPasswordExpiry: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true
    }
)


Userschema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();




})



Userschema.methods.isPasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}




Userschema.methods.generateAccessToken = async function () {
    const token = jwt.sign(
        {
            id: this._id,

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "2d"

        }

    )
    return token

}


Userschema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "10d"
        }
    );
}




export const Usermodel = mongoose.model("user", Userschema)







