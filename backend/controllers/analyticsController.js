import orderModel from "../models/orderModel.js";

// Sales Analytics
const getSalesAnalytics = async (req, res) => {
    try {
        const orders = await orderModel.find({ payment: true });
        
        const totalSales = orders.reduce((acc, order) => acc + order.amount, 0);
        const totalOrders = orders.length;
        
        const productStats = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (productStats[item.name]) {
                    productStats[item.name] += item.quantity;
                } else {
                    productStats[item.name] = item.quantity;
                }
            });
        });

        const topProducts = Object.keys(productStats)
            .map(name => ({ name, quantity: productStats[name] }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // Real monthly revenue calculation
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyStats = {};
        
        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthlyStats[months[d.getMonth()]] = 0;
        }

        orders.forEach(order => {
            const orderDate = new Date(order.date);
            const monthName = months[orderDate.getMonth()];
            if (monthlyStats[monthName] !== undefined) {
                monthlyStats[monthName] += order.amount;
            }
        });

        const monthlyRevenue = Object.keys(monthlyStats).map(month => ({
            month,
            revenue: monthlyStats[month]
        }));

        const categoryStats = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.category || 'Uncategorized';
                categoryStats[cat] = (categoryStats[cat] || 0) + (item.price * item.quantity);
            });
        });

        const topCategories = Object.keys(categoryStats).map(name => ({
            name,
            value: categoryStats[name]
        })).sort((a,b) => b.value - a.value);

        res.json({
            success: true,
            data: {
                totalSales,
                totalOrders,
                topProducts,
                monthlyRevenue,
                topCategories
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching analytics" });
    }
}

export { getSalesAnalytics };
