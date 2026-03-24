import axios from 'axios';
import 'dotenv/config';

let cachedToken = null;
let tokenExpiry = null;

const authenticate = async () => {
    try {
        if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
            return cachedToken;
        }

        const payload = {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
        };
        console.log("Shiprocket Auth Payload:", { 
            email: payload.email, 
            password: payload.password ? payload.password.substring(0, 2) + "..." : "undefined" 
        });

        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', payload);

        if (response.data && response.data.token) {
            cachedToken = response.data.token;
            // Token is typically valid for 10 days, but let's refresh slightly earlier (9 days)
            tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000;
            return cachedToken;
        } else {
            throw new Error('Authentication failed: No token received');
        }
    } catch (error) {
        const errorMsg = JSON.stringify(error.response?.data || error.message, null, 2);
        console.error('Shiprocket Authentication Error:', errorMsg);
        throw new Error(errorMsg);
    }
};

const createShipment = async (orderData) => {
    try {
        const token = await authenticate();
        if (!token) return null;

        const payload = {
            order_id: orderData._id.toString(),
            order_date: new Date(orderData.date).toISOString().split('T')[0],
            pickup_location: "Primary", // Should be configured in Shiprocket Panel
            billing_customer_name: orderData.address.firstName,
            billing_last_name: orderData.address.lastName,
            billing_address: orderData.address.street,
            billing_city: orderData.address.city,
            billing_pincode: orderData.address.zipcode,
            billing_state: orderData.address.state,
            billing_country: "India",
            billing_email: orderData.address.email,
            billing_phone: orderData.address.phone,
            shipping_is_billing: true,
            order_items: orderData.items.map(item => ({
                name: item.name,
                sku: item._id,
                units: item.quantity,
                selling_price: item.price,
                discount: "",
                tax: "",
                hsn: ""
            })),
            payment_method: (orderData.paymentMethod || "").toUpperCase() === "COD" ? "COD" : "Prepaid",
            sub_total: orderData.amount,
            length: 10, // Default dimensions
            width: 10,
            height: 10,
            weight: 0.5
        };

        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', payload, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.shipment_id) {
            const shipmentId = response.data.shipment_id;
            
            // Auto Assign Courier
            const bestCourier = await getCourierServiceability(orderData.address.zipcode, 0.5, orderData.paymentMethod === "COD" ? 1 : 0);
            if (bestCourier) {
                await assignCourier(shipmentId, bestCourier.courier_company_id);
                return {
                    shipmentId,
                    orderId: response.data.order_id,
                    status: response.data.status,
                    courierName: bestCourier.courier_name
                };
            }

            return {
                shipmentId,
                orderId: response.data.order_id,
                status: response.data.status
            };
        }
        return null;
    } catch (error) {
        console.error('Shiprocket Create Shipment Error:', error.response?.data || error.message);
        return null;
    }
};

const getTrackingInfo = async (shipmentId) => {
    try {
        const token = await authenticate();
        if (!token) return null;

        const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Shiprocket Tracking Error:', error.response?.data || error.message);
        return null;
    }
};

const getShippingLabel = async (shipmentId) => {
    try {
        const token = await authenticate();
        if (!token) return null;

        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/generate/label', {
            shipment_id: [shipmentId]
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data.label_url;
    } catch (error) {
        console.error('Shiprocket Label Generation Error:', error.response?.data || error.message);
        return null;
    }
};

const getCourierServiceability = async (pincode, weight, cod = 0) => {
    try {
        const token = await authenticate();
        if (!token) return null;

        const response = await axios.get(`https://apiv2.shiprocket.in/v1/external/courier/serviceability?delivery_postcode=${pincode}&weight=${weight}&cod=${cod}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data && response.data.data?.available_courier_companies) {
            // Sort by fastest delivery and lowest cost (custom logic can be more complex)
            const couriers = response.data.data.available_courier_companies;
            couriers.sort((a, b) => (parseFloat(a.rate) - parseFloat(b.rate)) || (parseInt(a.etd) - parseInt(b.etd)));
            return couriers[0]; // Return the best one
        }
        return null;
    } catch (error) {
        console.error('Shiprocket Serviceability Error:', error.response?.data || error.message);
        return null;
    }
};

const assignCourier = async (shipmentId, courierId) => {
    try {
        const token = await authenticate();
        if (!token) return null;

        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
            shipment_id: shipmentId,
            courier_id: courierId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Courier Assignment Error:', error.response?.data || error.message);
        return null;
    }
};

export default { authenticate, createShipment, getTrackingInfo, getShippingLabel, getCourierServiceability, assignCourier };
