import shiprocketService from "../services/shiprocketService.js";
import orderModel from "../models/orderModel.js";

const getTracking = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const trackingData = await shiprocketService.getTrackingInfo(shipmentId);
        
        if (trackingData) {
            res.json({ success: true, data: trackingData });
        } else {
            res.json({ success: false, message: "Tracking information not found" });
        }
    } catch (error) {
        console.error("Get Tracking Error:", error);
        res.json({ success: false, message: "Error fetching tracking info" });
    }
};

const getLabel = async (req, res) => {
    try {
        const { shipmentId } = req.params;
        const labelUrl = await shiprocketService.getShippingLabel(shipmentId);
        
        if (labelUrl) {
            // Update order with label URL
            await orderModel.findOneAndUpdate({ shipmentId }, { shippingLabelUrl: labelUrl });
            res.json({ success: true, labelUrl });
        } else {
            res.json({ success: false, message: "Label generation failed" });
        }
    } catch (error) {
        console.error("Get Label Error:", error);
        res.json({ success: false, message: "Error generating label" });
    }
};

export { getTracking, getLabel };
