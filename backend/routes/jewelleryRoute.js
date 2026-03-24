import express from "express";
import { addJewellery, listJewellery, removeJewellery, getJewelleryById, searchJewellery, getRecommendations } from "../controllers/jewelleryController.js";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
const jewelleryRouter = express.Router();

//Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
})

const upload = multer({ storage: storage })

jewelleryRouter.get("/list", listJewellery);
jewelleryRouter.get("/search", searchJewellery);
jewelleryRouter.get("/recommendations/:userId", getRecommendations);
jewelleryRouter.get("/:id", getJewelleryById);
jewelleryRouter.post("/add", authMiddleware, adminMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 4 }]), addJewellery);
jewelleryRouter.post("/remove", authMiddleware, adminMiddleware, removeJewellery);

export default jewelleryRouter;