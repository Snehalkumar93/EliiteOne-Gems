import { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import axios from 'axios';
import { StoreContext } from '../../../Context/StoreContext';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, PieChart as PieIcon, BarChart3, Activity, Barcode } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { token, url, currency } = useContext(StoreContext);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        topProducts: [],
        monthlyRevenue: [],
        topCategories: []
    });

    const COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#78350f'];

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/api/admin/analytics`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching analytics", error);
        }
    }, [token, url]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);


    return (
        <div className='dashboard'>
            <h1>Executive Dashboard</h1>
            
            <div className='stats-grid'>
                <div className='stat-card' onClick={() => navigate('/admin/list')}>
                    <div className='stat-icon blue'><DollarSign size={22} /></div>
                    <div className='stat-info'>
                        <p>Total Revenue</p>
                        <h3>{currency}{stats.totalSales?.toLocaleString()}</h3>
                    </div>
                </div>
                <div className='stat-card' onClick={() => navigate('/admin/orders')}>
                    <div className='stat-icon green'><ShoppingBag size={22} /></div>
                    <div className='stat-info'>
                        <p>Total Orders</p>
                        <h3>{stats.totalOrders}</h3>
                    </div>
                </div>
                <div className='stat-card' onClick={() => navigate('/admin/orders')}>
                    <div className='stat-icon purple'><TrendingUp size={22} /></div>
                    <div className='stat-info'>
                        <p>Avg. Order Value</p>
                        <h3>{currency}{stats.totalOrders > 0 ? (stats.totalSales / stats.totalOrders).toFixed(0) : 0}</h3>
                    </div>
                </div>
            </div>

            <div className='charts-container'>
                <div className='chart-item chart-full' onClick={() => navigate('/admin/orders')}>
                    <h3><Activity size={18} style={{ display:'inline', marginRight:'6px' }} /> Revenue Growth</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={stats.monthlyRevenue}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${currency}${val}`} />
                            <Tooltip contentStyle={{background: '#0f0a20', border: 'none', borderRadius: '12px', color: '#f8fafc'}} />
                            <Area type="monotone" dataKey="revenue" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className='chart-item' onClick={() => navigate('/admin/list')}>
                    <h3><BarChart3 size={18} style={{ display:'inline', marginRight:'6px' }} /> Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.topProducts} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: '#334155' }} />
                            <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 5, 5, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className='chart-item' onClick={() => navigate('/admin/list')}>
                    <h3><PieIcon size={18} style={{ display:'inline', marginRight:'6px' }} /> Revenue by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats.topCategories}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.topCategories?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
