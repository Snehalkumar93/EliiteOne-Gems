import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profileImage: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    isVerified: { type: Boolean, default: false },
    emailVerifyToken: String,
    emailVerifyExpiry: Date,
    verifyToken: { type: String, default: "" },
    verifyTokenExpiry: { type: Date, default: null },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date, default: null },
    browsingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'jewellery' }]
}, { minimize: false, timestamps: true })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;