import mongoose from "mongoose";

const jewellerySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true},
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    category:{ type:String, required:true},
    material: { type: String, required: true },
    weight: { type: String, required: true },
    purity: { type: String, required: true },
    stoneType: { type: String, required: true },
    occasion: { type: String, required: true },
    gender: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    certification: {
        hallmark: { type: String, default: "" },
        diamondCertificate: { type: String, default: "" },
        quality: { type: String, default: "" }
    },
    tags: { type: [String], default: [] }
})

const jewelleryModel = mongoose.models.jewellery || mongoose.model("jewellery", jewellerySchema, "jewelleries");
export default jewelleryModel;