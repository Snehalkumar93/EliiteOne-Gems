import { createContext, useEffect, useState, useCallback } from "react";
import { menu_list } from "../assets/assets";
import axios from "axios";
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {

    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [jewellery_list, setJewelleryList] = useState([]);
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem("cartItems");
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });
    const [token, setToken] = useState(localStorage.getItem("token") || "")
    const [role, setRole] = useState(localStorage.getItem("role") || "")
    const [userData, setUserData] = useState(() => {
        try {
            const saved = localStorage.getItem("userData");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    })
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const currency = "₹";
    const deliveryCharge = 50;

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { Authorization: `Bearer ${token}` } });
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { Authorization: `Bearer ${token}` } });
        }
    }

    const updateCartQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;
        setCartItems((prev) => ({ ...prev, [itemId]: quantity }));
        if (token) {
            await axios.post(url + "/api/cart/update", { itemId, quantity }, { headers: { Authorization: `Bearer ${token}` } });
        }
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            try {
              if (cartItems[item] > 0) {
                let itemInfo = jewellery_list.find((product) => product._id === item);
                if (itemInfo) { // Added safety check
                    totalAmount += itemInfo.price * cartItems[item];
                }
            }  
            } catch (error) {
                console.error("Error calculating cart total", error);
            }
            
        }
        return totalAmount;
    }

    const applyCoupon = async (code) => {
        const cartAmount = getTotalCartAmount();
        try {
            const response = await axios.post(url + "/api/coupon/validate", { code, cartAmount });
            if (response.data.success) {
                const { discountType, discountValue } = response.data;
                let calculatedDiscount = 0;
                if (discountType === 'percentage') {
                    calculatedDiscount = (cartAmount * discountValue) / 100;
                } else {
                    calculatedDiscount = discountValue;
                }
                setDiscount(calculatedDiscount);
                setAppliedCoupon(code.toUpperCase());
                return { success: true, message: response.data.message };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error("Error applying coupon:", error);
            return { success: false, message: "Error applying promo code" };
        }
    }

    const removeCoupon = () => {
        setDiscount(0);
        setAppliedCoupon(null);
    }

    const fetchJewelleryList = useCallback(async () => {
        try {
            const response = await axios.get(url + "/api/jewellery/list");
            if (response.data && response.data.success) {
                const updatedList = response.data.data.map(item => ({
                    ...item,
                    image_url: `${url}/images/${item.image}` // Providing absolute image URL
                }));
                setJewelleryList(updatedList);
            } else {
                setJewelleryList([]);
            }
        } catch (error) {
            console.error("Error fetching jewellery list:", error);
            setJewelleryList([]);
        }
    }, [url]);

    const fetchUserData = useCallback(async (token) => {
        if (!token) return;
        try {
            const response = await axios.get(url + "/api/user/me", { headers: { Authorization: `Bearer ${token}` } });
            if (response.data.success) {
                setUserData(response.data.data);
                setRole(response.data.data.role);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }, [url]);

    // Effect to sync userData with localStorage
    useEffect(() => {
        if (userData) {
            localStorage.setItem("userData", JSON.stringify(userData));
        } else {
            localStorage.removeItem("userData");
        }
    }, [userData]);

    const loadCartData = useCallback(async (token) => {
        try {
            const response = await axios.post(url + "/api/cart/get", {}, { headers: { Authorization: `Bearer ${token}` } });
            if (response.data && response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.error("Error loading cart data:", error);
        }
    }, [url]);

    // Effect to persist cart to localStorage for guest users
    useEffect(() => {
        if (!token) {
            if (Object.keys(cartItems).length > 0) {
                localStorage.setItem("cartItems", JSON.stringify(cartItems));
            } else {
                localStorage.removeItem("cartItems");
            }
        }
    }, [cartItems, token]);

    useEffect(() => {
        async function loadData() {
            const storedToken = localStorage.getItem("token");
            const promises = [fetchJewelleryList()];
            
            if (storedToken) {
                setToken(storedToken);
                setRole(localStorage.getItem("role") || "");
                promises.push(fetchUserData(storedToken));
                promises.push(loadCartData(storedToken));
            }
            
            await Promise.allSettled(promises);
        }
        loadData()
    }, [fetchJewelleryList, fetchUserData, loadCartData])

    const contextValue = {
        url,
        jewellery_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getTotalCartAmount,
        token,
        setToken,
        role,
        setRole,
        userData,
        setUserData,
        fetchUserData,
        loadCartData,
        setCartItems,
        currency,
        deliveryCharge,
        discount,
        setDiscount,
        appliedCoupon,
        setAppliedCoupon,
        applyCoupon,
        removeCoupon
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )

}

export default StoreContextProvider;