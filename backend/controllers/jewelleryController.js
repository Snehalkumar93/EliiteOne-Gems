import jewelleryModel from "../models/jewelleryModel.js";
import userModel from "../models/userModel.js";
import fs from 'fs'

// all jewellery list
const listJewellery = async (req, res) => {
    try {
        const jewelries = await jewelleryModel.find({})
        res.json({ success: true, data: jewelries })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// add jewellery
const addJewellery = async (req, res) => {
    try {
        let image_filename = req.files.image ? req.files.image[0].filename : "";
        let gallery_images = req.files.images ? req.files.images.map(file => file.filename) : [];

        const jewellery = new jewelleryModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            images: gallery_images,
            material: req.body.material,
            weight: req.body.weight,
            purity: req.body.purity,
            stoneType: req.body.stoneType,
            occasion: req.body.occasion,
            gender: req.body.gender,
            stock: Number(req.body.stock),
            certification: req.body.certification ? JSON.parse(req.body.certification) : {},
            tags: req.body.tags ? JSON.parse(req.body.tags) : []
        })

        await jewellery.save();
        res.json({ success: true, message: "Jewellery Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// delete jewellery
const removeJewellery = async (req, res) => {
    try {

        const jewellery = await jewelleryModel.findById(req.body.id);
        fs.unlink(`uploads/${jewellery.image}`, () => { })

        await jewelleryModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Jewellery Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

// get single jewellery
const getJewelleryById = async (req, res) => {
    try {
        const jewellery = await jewelleryModel.findById(req.params.id);
        if (jewellery) {
            // Log to browsing history if userId is provided (optional, can be done via frontend)
            res.json({ success: true, data: jewellery })
        } else {
            res.json({ success: false, message: "Jewellery not found" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Search jewellery
const searchJewellery = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        const searchRegex = new RegExp(q, 'i');
        const results = await jewelleryModel.find({
            $or: [
                { name: searchRegex },
                { category: searchRegex },
                { tags: searchRegex },
                { material: searchRegex }
            ]
        }).limit(10);

        res.json({ success: true, data: results });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error in search" });
    }
}

// Get AI Recommendations
const getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        let recommendations = [];

        if (userId && userId !== 'null') {
            const user = await userModel.findById(userId).populate('browsingHistory');
            if (user && user.browsingHistory.length > 0) {
                const recentCategories = [...new Set(user.browsingHistory.map(item => item.category))];
                recommendations = await jewelleryModel.find({
                    category: { $in: recentCategories },
                    _id: { $nin: user.browsingHistory.map(item => item._id) }
                }).limit(8);
            }
        }

        // Fill with trending/popular if not enough recommendations
        if (recommendations.length < 4) {
            const popular = await jewelleryModel.find({}).sort({ stock: -1 }).limit(8); // Simple popularity logic
            recommendations = [...recommendations, ...popular];
            // Remove duplicates
            const uniqueRecs = Array.from(new Set(recommendations.map(a => a._id.toString())))
                .map(id => recommendations.find(a => a._id.toString() === id));
            recommendations = uniqueRecs.slice(0, 8);
        }

        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching recommendations" });
    }
}

export { listJewellery, addJewellery, removeJewellery, getJewelleryById, searchJewellery, getRecommendations }
